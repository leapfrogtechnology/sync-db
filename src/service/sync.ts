import { Knex } from 'knex';

import * as sqlRunner from './sqlRunner';
import * as runLogger from './runLogger';
import { dbLogger } from '../util/logger';
import { getSqlBasePath } from '../config';
import { getElapsedTime } from '../util/ts';
import { executeOperation } from './execution';
import * as configInjection from './configInjection';
import { convertToCreateOrReplace } from '../util/string';
import SynchronizeContext from '../domain/SynchronizeContext';
import OperationResult from '../domain/operation/OperationResult';
import OperationContext from '../domain/operation/OperationContext';
import { checkIfSynchronizeRunExists } from './runLogger';

/**
 * Migrate SQL on a database.
 *
 * @param {Knex.Transaction} trx
 * @param {SynchronizeContext} context
 * @returns {Promise<void>}
 */
async function setup(
  trx: Knex.Transaction,
  context: SynchronizeContext,
  shouldRunPartialSync: boolean,
  filteredSql: string[]
): Promise<void> {
  const { connectionId } = context;
  const { hooks, sql } = context.config;
  const sqlBasePath = getSqlBasePath(context.config);
  const log = dbLogger(connectionId);

  log(`Running setup.`);

  if (shouldRunPartialSync && filteredSql.length == 0) {
    log('No SQL files to synchronize in partial sync after filtering. Skipping setup.');

    return;
  }

  // Determine which SQL files to sync
  const sqlFilesToUse = shouldRunPartialSync ? filteredSql : sql;
  const sqlScripts = await sqlRunner.resolveFiles(sqlBasePath, sqlFilesToUse);
  const { pre_sync: preMigrationScripts, post_sync: postMigrationScripts } = hooks;

  // Config Injection: Setup
  // This will setup a config table (temporary and accessible only to this transaction).
  await configInjection.setup(trx, context);

  if (preMigrationScripts.length > 0) {
    const preHookScripts = await sqlRunner.resolveFiles(sqlBasePath, preMigrationScripts);

    log('PRE-SYNC: Begin');
    // Run the pre hook scripts
    await sqlRunner.runSequentially(trx, preHookScripts, connectionId);
    log('PRE-SYNC: End');
  }

  // Modify SQL scripts to use CREATE OR REPLACE for idempotent operations
  let sqlScriptsToRun = sqlScripts;

  if (shouldRunPartialSync) {
    const dbClient = trx.client.config.client;
    sqlScriptsToRun = sqlScripts.map(script => ({
      ...script,
      sql: convertToCreateOrReplace(script.sql, dbClient)
    }));
  }

  // Run the synchronization scripts.
  await sqlRunner.runSequentially(trx, sqlScriptsToRun, connectionId);

  if (postMigrationScripts.length > 0) {
    const postHookScripts = await sqlRunner.resolveFiles(sqlBasePath, postMigrationScripts);

    log('POST-SYNC: Begin');
    // Run the pre hook scripts
    await sqlRunner.runSequentially(trx, postHookScripts, connectionId);
    log('POST-SYNC: End');
  }

  // Config Injection: Cleanup
  // Cleans up the injected config and the table.
  await configInjection.cleanup(trx, context);

  log('Finished setup');
}

/**
 * Executes drop statements (if exists) for all the objects
 * that have been created in the database.
 * They're executed in the reverse order of their creation.
 *
 * @param {Knex.Transaction} trx
 * @param {OperationContext} context
 * @returns {Promise<void>}
 */
async function teardown(trx: Knex.Transaction, context: OperationContext): Promise<void> {
  const { sql } = context.config;
  const sqlBasePath = getSqlBasePath(context.config);
  const log = dbLogger(context.connectionId);

  log(`Running rollback on connection id: ${context.connectionId}`);

  const fileInfoList = sql.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${sqlBasePath}/`, '')));

  await sqlRunner.rollbackSequentially(trx, fileInfoList, context.connectionId);

  log('Finished running rollback');
}

/**
 * Run synchronize on the given database connection (transaction).
 *
 * @param {Knex.Transaction} trx
 * @param {SynchronizeContext} context
 * @returns {Promise<OperationResult>}
 */
export async function runSynchronize(trx: Knex.Transaction, context: SynchronizeContext): Promise<OperationResult> {
  const { connectionId } = context;
  let runId: string | undefined;

  return executeOperation(context, async options => {
    const { migrateFunc } = context;
    const { timeStart } = options;
    const log = dbLogger(connectionId);

    // Check if sync-files option is provided
    const syncFiles = context.params['sync-files'];
    const hasAtLeastASyncRun = await checkIfSynchronizeRunExists(context.connection, connectionId);

    const availableSql = context.config.sql;

    // Filter sync files to only include those that are available in the config and exclude any '.drop' files
    const filteredSql = (syncFiles || []).filter(file => availableSql.includes(file) && !file.includes('.drop'));
    const isPartialSync = filteredSql.length > 0;

    // Determine if we should run partial sync:
    // - Only run partial sync if there's a previous sync AND sync-files is provided
    // - If no previous sync exists, always run full sync (with teardown)
    const shouldRunPartialSync = hasAtLeastASyncRun && isPartialSync;

    try {
      // Start run log
      runId = await runLogger.startRunLog(context.connection, {
        command_type: runLogger.CommandType.SYNCHRONIZE,
        connection_id: connectionId,
        metadata: {
          skipMigration: context.params['skip-migration'],
          force: context.params.force,
          syncFiles: shouldRunPartialSync ? filteredSql : undefined
        }
      });

      // Skip teardown only if doing partial sync
      if (hasAtLeastASyncRun || shouldRunPartialSync) {
        log(`Partial sync mode: skipping teardown for ${filteredSql?.length} file(s).`);
      } else {
        await teardown(trx, context);

        // Trigger onTeardownSuccess if bound.
        if (context.params.onTeardownSuccess) {
          await context.params.onTeardownSuccess({
            connectionId,
            data: null,
            success: true,
            timeElapsed: getElapsedTime(timeStart)
          });
        }
      }

      if (context.params['skip-migration']) {
        log('Skipped migrations.');
      } else {
        log('Running migrations.');
        await migrateFunc(trx);
      }

      await setup(trx, context, !!hasAtLeastASyncRun, filteredSql);

      // Complete run log with success
      await runLogger.completeRunLog(context.connection, runId, {
        is_successful: true
      });
    } catch (error) {
      // Complete run log with failure
      if (runId) {
        await runLogger.completeRunLog(context.connection, runId, {
          is_successful: false,
          error: error.message || error.toString()
        });
      }
      throw error;
    }
  });
}

/**
 * Rune prune operation (drop all synchronized objects) on the given database connection (transaction).
 *
 * @param {Knex.Transaction} trx
 * @param {OperationContext} context
 * @returns {Promise<OperationResult>}
 */
export async function runPrune(trx: Knex.Transaction, context: OperationContext): Promise<OperationResult> {
  const { connectionId } = context;
  let runId: string | undefined;

  return executeOperation(context, async () => {
    try {
      // Start run log
      runId = await runLogger.startRunLog(context.connection, {
        command_type: runLogger.CommandType.PRUNE,
        connection_id: connectionId
      });

      await teardown(trx, context);

      // Complete run log with success
      await runLogger.completeRunLog(context.connection, runId, { is_successful: true });
    } catch (error) {
      // Complete run log with failure
      if (runId) {
        await runLogger.completeRunLog(context.connection, runId, {
          is_successful: false,
          error: error.message || error.toString()
        });
      }
      throw error;
    }
  });
}
