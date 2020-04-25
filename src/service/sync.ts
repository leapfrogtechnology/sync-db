import * as Knex from 'knex';

import * as sqlRunner from './sqlRunner';
import { dbLogger } from '../util/logger';
import { getElapsedTime } from '../util/ts';
import SynchronizeContext from '../domain/SynchronizeContext';
import * as configInjection from './configInjection';
import OperationResult from '../domain/operation/OperationResult';
import OperationContext from '../domain/operation/OperationContext';
import { executeOperation } from './execution';

/**
 * Migrate SQL on a database.
 *
 * @param {Knex.Transaction} trx
 * @param {SynchronizeContext} context
 * @returns {Promise<void>}
 */
async function setup(trx: Knex.Transaction, context: SynchronizeContext): Promise<void> {
  const { connectionId } = context;
  const { basePath, hooks, sql } = context.config;
  const log = dbLogger(connectionId);

  log(`Running setup.`);

  const sqlScripts = await sqlRunner.resolveFiles(basePath, sql);
  const { pre_sync: preMigrationScripts, post_sync: postMigrationScripts } = hooks;

  // Config Injection: Setup
  // This will setup a config table (temporary and accessible only to this transaction).
  await configInjection.setup(trx, context);

  if (preMigrationScripts.length > 0) {
    const preHookScripts = await sqlRunner.resolveFiles(basePath, preMigrationScripts);

    log('PRE-SYNC: Begin');
    // Run the pre hook scripts
    await sqlRunner.runSequentially(trx, preHookScripts, connectionId);
    log('PRE-SYNC: End');
  }

  // Run the migration scripts.
  await sqlRunner.runSequentially(trx, sqlScripts, connectionId);

  if (postMigrationScripts.length > 0) {
    const postHookScripts = await sqlRunner.resolveFiles(basePath, postMigrationScripts);

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
  const { basePath, sql } = context.config;
  const log = dbLogger(context.connectionId);

  log(`Running rollback on connection id: ${context.connectionId}`);

  const fileInfoList = sql.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${basePath}/`, '')));

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
  return executeOperation(context, async options => {
    const { connectionId, migrateFunc } = context;
    const { timeStart } = options;
    const log = dbLogger(connectionId);

    // Trigger onStarted handler if bound.
    if (context.params.onStarted) {
      await context.params.onStarted({
        connectionId,
        success: false,
        data: null,
        timeElapsed: getElapsedTime(timeStart)
      });
    }

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

    if (context.params['skip-migration']) {
      log('Skipped migrations.');
    } else {
      log('Running migrations.');
      await migrateFunc(trx);
    }

    await setup(trx, context);
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
  return executeOperation(context, () => teardown(trx, context));
}
