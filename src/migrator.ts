import { log, dbLogger } from './logger';
import * as sqlRunner from './sqlRunner';
import { createInstance } from './util/db';
import SyncParams from './domain/SyncParams';
import Connection from './domain/Connection';
import Configuration from './domain/Configuration';

/**
 * Migrate SQL on a database.
 *
 * @param {Configuration} config
 * @returns {(connectionConfig: Connection) => Promise<void>}
 */
export function setup(config: Configuration): (connectionConfig: Connection) => Promise<void> {
  const { basePath, hooks, sql } = config;

  return async (connectionConfig: Connection) => {
    const logDb = dbLogger(connectionConfig);

    logDb('Running setup');

    const db = createInstance(connectionConfig);
    const sqlScripts = await sqlRunner.resolveFiles(basePath, sql);
    const { pre_sync: preMigrationScripts, post_sync: postMigrationScripts } = hooks;

    await db.transaction(async trx => {
      if (preMigrationScripts.length > 0) {
        const preHookScripts = await sqlRunner.resolveFiles(basePath, preMigrationScripts);

        logDb('PRE-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(preHookScripts, trx, connectionConfig);
        logDb('PRE-SYNC: End');
      }

      // Run the migration scripts.
      await sqlRunner.runSequentially(sqlScripts, trx, connectionConfig);

      if (postMigrationScripts.length > 0) {
        const postHookScripts = await sqlRunner.resolveFiles(basePath, postMigrationScripts);

        logDb('POST-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(postHookScripts, trx, connectionConfig);
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
export function teardown(config: Configuration): (connectionConfig: Connection) => Promise<void> {
  const { basePath, sql } = config;

  return async (connectionConfig: Connection) => {
    const logDb = dbLogger(connectionConfig);

    logDb(`Running rollback on a database: ${connectionConfig.id}`);

    const db = createInstance(connectionConfig);
    const fileInfoList = sql.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${basePath}/`, '')));

    await sqlRunner.rollbackSequentially(fileInfoList, db, connectionConfig);

    logDb('Finished running rollback');
  };
}

/**
 * Synchronize database.
 *
 * @param {Configuration} config
 * @param {Connection[]} connections
 * @param {SyncParams} params
 */
export async function synchronize(config: Configuration, connections: Connection[], params: SyncParams) {
  log('Starting to synchronize.');
  const promises = connections.map(connectionConfig => syncDatabase(connectionConfig, config));

  await Promise.all(promises);

  log('All synchronized');
}

/**
 * Synchronize a specific database.
 *
 * @param {Connection} connectionConfig
 * @param {Configuration} config
 */
async function syncDatabase(connectionConfig: Connection, config: Configuration) {
  const logDb = dbLogger(connectionConfig);

  logDb('Synchronize database');

  await teardown(config)(connectionConfig);
  await setup(config)(connectionConfig);
}
