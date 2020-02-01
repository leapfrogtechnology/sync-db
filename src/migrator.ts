import * as Knex from 'knex';

import Connection from './Connection';
import * as sqlRunner from './sqlRunner';
import { log, dbLogger } from './logger';
import { getConnectionId } from './config';
import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import SyncContext from './domain/SyncContext';
import ConnectionConfig from './domain/ConnectionConfig';

import * as configInjection from './services/configInjection';

/**
 * Migrate SQL on a database.
 *
 * @param {Knex.Transaction} trx
 * @param {SyncContext} context
 * @returns {Promise<void>}
 */
async function setup(trx: Knex.Transaction, context: SyncContext): Promise<void> {
  const { basePath, hooks, sql } = context.config;
  const logDb = dbLogger(context.connectionId);

  logDb(`Running setup on connection: ${context.connectionId}`);

  const sqlScripts = await sqlRunner.resolveFiles(basePath, sql);
  const { pre_sync: preMigrationScripts, post_sync: postMigrationScripts } = hooks;

  // Config Injection: Setup
  // This will setup a config table (temporary and accessible only to this transaction).
  await configInjection.setup(trx, config);

  if (preMigrationScripts.length > 0) {
    const preHookScripts = await sqlRunner.resolveFiles(basePath, preMigrationScripts);

    logDb('PRE-SYNC: Begin');
    // Run the pre hook scripts
    await sqlRunner.runSequentially(trx, preHookScripts, context.connectionId);
    logDb('PRE-SYNC: End');
  }

  // Run the migration scripts.
  await sqlRunner.runSequentially(trx, sqlScripts, context.connectionId);

  if (postMigrationScripts.length > 0) {
    const postHookScripts = await sqlRunner.resolveFiles(basePath, postMigrationScripts);

    logDb('POST-SYNC: Begin');
    // Run the pre hook scripts
    await sqlRunner.runSequentially(trx, postHookScripts, context.connectionId);
    logDb('POST-SYNC: End');
  }

  // Config Injection: Cleanup
  // Cleans up the injected config and the table.
  await configInjection.cleanup(trx, config);

  logDb('Finished setup');
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
  const logDb = dbLogger(context.connectionId);

  logDb(`Running rollback on connection id: ${context.connectionId}`);

  const fileInfoList = sql.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${basePath}/`, '')));

  await sqlRunner.rollbackSequentially(trx, fileInfoList, context.connectionId);

  logDb('Finished running rollback');
}

/**
 * Synchronize database.
 *
 * @param {SyncContext} config
 * @param {ConnectionConfig[] | ConnectionConfig | Knex[] | Knex} conn
 * @param {SyncParams} params
 */
export async function synchronize(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  params?: SyncParams
) {
  log('Starting to synchronize.');
  const connArr = Array.isArray(conn) ? conn : [conn];
  const connections = mapToConnectionInstances(connArr);
  const promises = connections.map(connection =>
    syncDatabase(connection.getInstance(), {
      config,
      connectionId: getConnectionId(connection.getConfig())
    })
  );

  await Promise.all(promises);

  log('All synchronized');
}

/**
 * Map connection configuration list to the connection instances.
 *
 * @param {((ConnectionConfig | Knex)[])} connectionList
 * @returns {Connection[]}
 */
function mapToConnectionInstances(connectionList: (ConnectionConfig | Knex)[]): Connection[] {
  return connectionList.map(con => {
    if (Connection.isKnexInstance(con)) {
      log(`Received connection instance to database: ${con.client.config.connection.database}`);

      return Connection.withKnex(con);
    }

    log(`Received connection config to database: ${con.database}`);

    return new Connection(con);
  });
}

/**
 * Synchronize a specific database.
 *
 * @param {Knex} connection
 * @param {SyncContext} context
 */
async function syncDatabase(connection: Knex, context: SyncContext) {
  const logDb = dbLogger(context.connectionId);

  logDb('Synchronize database');

  // Run the process in a single transaction for a database connection.
  await connection.transaction(async trx => {
    await teardown(trx, context);
    await setup(trx, context);
  });
}
