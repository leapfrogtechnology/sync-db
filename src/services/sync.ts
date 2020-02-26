import * as Knex from 'knex';

import { dbLogger } from '../logger';

import { NS_PER_SEC } from '../constants';
import SyncResult from '../domain/SyncResult';
import SyncContext from '../domain/SyncContext';
import * as configInjection from './configInjection';
import ExecutionContext from '../domain/ExecutionContext';
import { runSequentially, rollbackSequentially } from './sqlRunner';

/**
 * Migrate SQL on a database.
 *
 * @param {Knex.Transaction} trx
 * @param {SyncContext} context
 * @returns {Promise<void>}
 */
async function setup(trx: Knex.Transaction, context: SyncContext): Promise<void> {
  const { connectionId } = context;
  const log = dbLogger(connectionId);

  log(`Running setup.`);

  // Resolve loaded source code.
  const sqlScripts = context.source.sql;
  const { preSync: preHookScripts, postSync: postHookScripts } = context.source.hooks;

  // Config Injection: Setup
  // This will setup a config table (temporary and accessible only to this transaction).
  await configInjection.setup(trx, context);

  if (preHookScripts.length > 0) {
    log('PRE-SYNC: Begin');
    // Run the pre hook scripts
    await runSequentially(trx, preHookScripts, connectionId);
    log('PRE-SYNC: End');
  }

  // Run the migration scripts.
  await runSequentially(trx, sqlScripts, connectionId);

  if (postHookScripts.length > 0) {
    log('POST-SYNC: Begin');
    // Run the pre hook scripts
    await runSequentially(trx, postHookScripts, connectionId);
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
  const log = dbLogger(context.connectionId);

  log(`Running rollback on connection: ${context.connectionId}`);

  await rollbackSequentially(trx, context.source.sql, context.connectionId);

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

  const timeDiff = process.hrtime(timeStart);
  const timeElapsed = Number(timeDiff[0]) + Number(timeDiff[1] / NS_PER_SEC);

  log(`Execution completed in ${timeDiff[0]} s, ${timeDiff[1]} ns`);

  // If it's a CLI environment, invoke the handler.
  if (context.isCLI) {
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
