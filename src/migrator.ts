import * as Knex from 'knex';

import Connection from './Connection';
import { log, dbLogger } from './logger';
import * as sqlRunner from './sqlRunner';
import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import ConnectionConfig from './domain/ConnectionConfig';

/**
 * Migrate SQL on a database.
 *
 * @param {SyncConfig} config
 * @returns {(connection: Connection) => Promise<void>}
 */
export function setup(config: SyncConfig): (connection: Connection) => Promise<void> {
  const { basePath, hooks, sql } = config;

  return async (connection: Connection) => {
    const logDb = dbLogger(connection);

    logDb(`Running setup on connection id: ${connection.getConfig().id}`);

    const sqlScripts = await sqlRunner.resolveFiles(basePath, sql);
    const { pre_sync: preMigrationScripts, post_sync: postMigrationScripts } = hooks;

    await connection.transaction(async t => {
      if (preMigrationScripts.length > 0) {
        const preHookScripts = await sqlRunner.resolveFiles(basePath, preMigrationScripts);

        logDb('PRE-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(preHookScripts, t);
        logDb('PRE-SYNC: End');
      }

      // Run the migration scripts.
      await sqlRunner.runSequentially(sqlScripts, t);

      if (postMigrationScripts.length > 0) {
        const postHookScripts = await sqlRunner.resolveFiles(basePath, postMigrationScripts);

        logDb('POST-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(postHookScripts, t);
        logDb('POST-SYNC: End');
      }

      logDb('Finished setup');
    });
  };
}

/**
 * Executes drop statements (if exists) for all the objects
 * that have been created in the database.
 * They're executed in the reverse order of their creation.
 *
 * @param {SyncConfig} config
 * @returns {(connection: Connection) => Promise<void>}
 */
export function teardown(config: SyncConfig): (connection: Connection) => Promise<void> {
  const { basePath, sql } = config;

  return async (connection: Connection) => {
    const logDb = dbLogger(connection);

    logDb(`Running rollback on connection id: ${connection.getConfig().id}`);

    const fileInfoList = sql.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${basePath}/`, '')));

    await sqlRunner.rollbackSequentially(fileInfoList, connection);

    logDb('Finished running rollback');
  };
}

/**
 * Synchronize database.
 *
 * @param {SyncConfig} config
 * @param {ConnectionConfig[] | Knex[] | ConnectionConfig | Knex} connections
 * @param {SyncParams} params
 */
export async function synchronize(
  config: SyncConfig,
  conn: ConnectionConfig[] | Knex[] | ConnectionConfig | Knex,
  params: SyncParams
) {
  log('Starting to synchronize.');
  const connArr = Array.isArray(conn) ? conn : [conn];

  const connections = connArr.map(con => {
    if (Connection.isKnexInstance(con)) {
      log(`Received connection instance to database: ${con.client.config.connection.database}`);

      return Connection.withKnex(con);
    }

    log(`Received connection config to database: ${con.database}`);

    return new Connection(con);
  });

  const promises = connections.map(connection => syncDatabase(connection, config));

  await Promise.all(promises);

  log('All synchronized');
}

/**
 * Synchronize a specific database.
 *
 * @param {Connection} connection
 * @param {SyncConfig} config
 */
async function syncDatabase(connection: Connection, config: SyncConfig) {
  const logDb = dbLogger(connection);

  logDb('Synchronize database');

  await teardown(config)(connection);
  await setup(config)(connection);
}
