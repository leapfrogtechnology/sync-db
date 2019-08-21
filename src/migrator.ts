import Connection from './Connection';
import { log, dbLogger } from './logger';
import * as sqlRunner from './sqlRunner';
import SyncParams from './domain/SyncParams';
import Configuration from './domain/Configuration';
import ConnectionConfig from './domain/ConnectionConfig';
import ConnectionInstance from './domain/ConnectionInstance';

/**
 * Migrate SQL on a database.
 *
 * @param {Configuration} config
 * @returns {(connectionConfig: ConnectionConfig) => Promise<void>}
 */
export function setup(config: Configuration): (connectionConfig: Connection) => Promise<void> {
  const { basePath, hooks, sql } = config;

  return async (connection: Connection) => {
    const logDb = dbLogger(connection.config);

    logDb('Running setup');

    const sqlScripts = await sqlRunner.resolveFiles(basePath, sql);
    const { pre_sync: preMigrationScripts, post_sync: postMigrationScripts } = hooks;

    await connection.instance.transaction(async trx => {
      if (preMigrationScripts.length > 0) {
        const preHookScripts = await sqlRunner.resolveFiles(basePath, preMigrationScripts);

        logDb('PRE-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(preHookScripts, trx, connection.config);
        logDb('PRE-SYNC: End');
      }

      // Run the migration scripts.
      await sqlRunner.runSequentially(sqlScripts, trx, connection.config);

      if (postMigrationScripts.length > 0) {
        const postHookScripts = await sqlRunner.resolveFiles(basePath, postMigrationScripts);

        logDb('POST-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(postHookScripts, trx, connection.config);
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
 * @param {Configuration} config
 * @returns {(connectionConfig: Connection) => Promise<void>}
 */
export function teardown(config: Configuration): (connection: Connection) => Promise<void> {
  const { basePath, sql } = config;

  return async (connection: Connection) => {
    const logDb = dbLogger(connection.config);

    logDb(`Running rollback on a database: ${connection.config.id}`);

    const db = connection.instance;
    const fileInfoList = sql.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${basePath}/`, '')));

    await sqlRunner.rollbackSequentially(fileInfoList, db, connection.config);

    logDb('Finished running rollback');
  };
}

/**
 * Synchronize database.
 *
 * @param {Configuration} config
 * @param {ConnectionConfig[]} connections
 * @param {SyncParams} params
 */
export async function synchronize(
  config: Configuration,
  conn: ConnectionConfig[] | ConnectionInstance[] | ConnectionConfig | ConnectionInstance,
  params: SyncParams
) {
  log('Starting to synchronize.');
  let connections: ConnectionConfig[] | ConnectionInstance[] | Connection[];

  connections = (Array.isArray(conn) ? conn : [conn]) as ConnectionConfig[] | ConnectionInstance[];

  connections = (connections as any[]).map(connection => {
    if (connection.client.config) {
      // If the connection object has 'client.config' property consider it to be a connection instance.
      return Connection.withInstance(connection as ConnectionInstance);
    }

    return new Connection((connection as ConnectionConfig));
  });

  const promises = (connections as Connection[]).map(connection => syncDatabase(connection, config));

  await Promise.all(promises);

  log('All synchronized');
}

/**
 * Synchronize a specific database.
 *
 * @param {ConnectionConfig} connectionConfig
 * @param {Configuration} config
 */
async function syncDatabase(connection: Connection, config: Configuration) {
  const logDb = dbLogger(connection.config);

  logDb('Synchronize database');

  await teardown(config)(connection);
  await setup(config)(connection);
}
