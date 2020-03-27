import * as Knex from 'knex';

import { isCLI } from '../config';
import { dbLogger } from '../logger';
import * as sqlRunner from './sqlRunner';
import { getElapsedTime } from '../util/ts';
import SyncResult from '../domain/SyncResult';
import SyncContext from '../domain/SyncContext';
import * as configInjection from './configInjection';
import ExecutionContext from '../domain/ExecutionContext';

/**
 * Migrate SQL on a database.
 *
 * @param {Knex.Transaction} trx
 * @param {SyncContext} context
 * @returns {Promise<void>}
 */
async function setup(trx: Knex.Transaction, context: SyncContext): Promise<void> {
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
 * @param {SyncContext} context
 * @returns {Promise<void>}
 */
async function teardown(trx: Knex.Transaction, context: SyncContext): Promise<void> {
  const { basePath, sql } = context.config;
  const log = dbLogger(context.connectionId);

  log(`Running rollback on connection id: ${context.connectionId}`);

  const fileInfoList = sql.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${basePath}/`, '')));

  await sqlRunner.rollbackSequentially(trx, fileInfoList, context.connectionId);

  log('Finished running rollback');
}

/**
 * Synchronize on a single database connection.
 *
 * @param {Knex} connection
 * @param {SyncContext} context
 * @returns {Promise<SyncResult>}
 */
export async function synchronizeDatabase(connection: Knex, context: SyncContext): Promise<SyncResult> {
  const { connectionId } = context;
  const log = dbLogger(connectionId);
  const result: SyncResult = { connectionId, success: false };

  const timeStart = process.hrtime();

  try {
    log('Starting synchronization.');

    // Run the process in a single transaction for a database connection.
    await connection.transaction(async trx => {
      await teardown(trx, context);
      await setup(trx, context);
    });

    log(`Synchronization successful.`);
    result.success = true;
  } catch (e) {
    log(`Error caught for connection ${connectionId}:`, e);
    result.error = e;
  }

  const timeElapsed = getElapsedTime(timeStart);

  log(`Execution completed in ${timeElapsed} s`);

  // If it's a CLI environment, invoke the handler.
  if (isCLI()) {
    const handler = result.success ? context.params.onSuccess : context.params.onFailed;
    const execContext: ExecutionContext = {
      connectionId,
      timeElapsed,
      success: result.success
    };

    await handler(execContext);
  }

  return result;
}
