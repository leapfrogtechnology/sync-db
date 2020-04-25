import * as Knex from 'knex';

import { dbLogger } from '../../util/logger';
import { executeOperation } from '../../service/execution';
import MigrationContext from '../../domain/MigrationContext';
import OperationResult from '../../domain/operation/OperationResult';

export enum KnexMigrationAPI {
  MIGRATE_LIST = 'migrate.list',
  MIGRATE_LATEST = 'migrate.latest',
  MIGRATE_ROLLBACK = 'migrate.rollback'
}

/**
 * A map of Knex's migration API functions.
 */
const migrationApiMap = {
  // Run up to the latest migrations.
  [KnexMigrationAPI.MIGRATE_LATEST]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.latest(config),

  // Rollback migrations.
  [KnexMigrationAPI.MIGRATE_ROLLBACK]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.rollback(config),

  // List migrations.
  [KnexMigrationAPI.MIGRATE_LIST]: (trx: Knex | Knex.Transaction, config: Knex.MigratorConfig) =>
    trx.migrate.list(config)
};

/**
 * Invoke Knex's migration API for given function.
 *
 * @param {Knex.Transaction} trx
 * @param {KnexMigrationAPI} funcName
 * @param {MigrationContext} context
 * @returns {Promise<OperationResult>}
 */
export async function invokeMigrationApi(
  trx: Knex.Transaction,
  funcName: KnexMigrationAPI,
  context: MigrationContext
): Promise<OperationResult> {
  return executeOperation(context, async () => {
    const func = migrationApiMap[funcName];

    const dbLog = dbLogger(context.connectionId);

    dbLog(`BEGIN: ${funcName}`);

    const data = await func(trx, context.knexMigrationConfig);

    dbLog(`END: ${funcName}`);
    dbLog('Result:\n%O', data);

    return data;
  });
}
