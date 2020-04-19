import Knex from 'knex';

import { isCLI } from '../config';
import { dbLogger } from '../util/logger';
import { getElapsedTime } from '../util/ts';
import SyncConfig from '../domain/SyncConfig';

export interface MigrationResult {
  connectionId: string;
  success: boolean;
  timeElapsed: number;
  data: any;
  error?: any;
}

export interface MigrationCommandParams {
  onSuccess: (result: MigrationResult) => Promise<any>;
  onFailed: (context: MigrationResult) => Promise<any>;
}

export interface MigrationCommandContext {
  config: SyncConfig;
  connectionId: string;
  params: MigrationCommandParams;
  knexMigrationConfig: Knex.MigratorConfig;
}

/**
 * A map of Knex's migration API functions.
 */
export const migrationApiMap = {
  'migrate.latest': (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => trx.migrate.latest(config),
  'migrate.rollback': (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => trx.migrate.rollback(config),
  'migrate.list': (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => trx.migrate.list(config)
};

/**
 * Invoke Knex's migration API.
 *
 * @param {(Knex | Knex.Transaction)} trx
 * @param {MigrationCommandContext} context
 * @param {((trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => Promise<any>)} func
 * @returns {Promise<MigrationResult>}
 */
export async function runMigrateFunc(
  trx: Knex | Knex.Transaction,
  context: MigrationCommandContext,
  func: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) => Promise<any>
): Promise<MigrationResult> {
  const dbLog = dbLogger(context.connectionId);
  const { connectionId, knexMigrationConfig } = context;
  const funcName = func.name || 'func';

  let error;
  let data;

  const timeStart = process.hrtime();

  try {
    dbLog(`BEGIN: ${funcName}`);
    data = await func(trx, knexMigrationConfig);

    dbLog(`END: ${funcName}`);
    dbLog('Result:\n%O', data);
  } catch (e) {
    dbLog(`Error caught for connection ${connectionId}:`, e);
    error = e;
  }

  const timeElapsed = getElapsedTime(timeStart);

  dbLog(`Execution completed in ${timeElapsed} s`);

  const result: MigrationResult = {
    connectionId,
    error,
    data,
    timeElapsed,
    success: !error
  };

  // If it's a CLI environment, invoke the handler.
  if (isCLI()) {
    const handler = result.success ? context.params.onSuccess : context.params.onFailed;

    await handler(result);
  }

  return result;
}
