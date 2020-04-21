import Knex from 'knex';

import { dbLogger } from '../util/logger';
import { getElapsedTime } from '../util/ts';
import Configuration from '../domain/Configuration';

export interface MigrationResult {
  connectionId: string;
  success: boolean;
  timeElapsed: number;
  data: any;
  error?: any;
}

export interface MigrationCommandParams {
  onSuccess?: (result: MigrationResult) => Promise<any>;
  onFailed?: (context: MigrationResult) => Promise<any>;
}

export interface MigrationCommandContext {
  config: Configuration;
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

  // Invoke corresponding handlers if they're sent.
  if (result.success && context.params.onSuccess) {
    await context.params.onSuccess(result);
  } else if (!result.success && context.params.onFailed) {
    await context.params.onFailed(result);
  }

  return result;
}
