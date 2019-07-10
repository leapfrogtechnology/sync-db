import * as path from 'path';

import { log, dbLogger } from './logger';
import * as sqlRunner from './sqlRunner';
import { createInstance } from './util/db';
import SyncParams from './domain/SyncParams';
import Connection from './domain/Connection';
import Configuration from './domain/Configuration';

const sqlPath = path.resolve(process.cwd(), 'src/sql');

/**
 * Migrate SQL on a database.
 *
 * @param {Configuration} config
 * @returns {((dbConfig: Connection) => Promise<void>)}
 */
export function setup(config: Configuration): (dbConfig: Connection) => Promise<void> {
  return async (dbConfig: Connection) => {
    const logDb = dbLogger(dbConfig);

    logDb('Running setup');

    const db = createInstance(dbConfig);
    const sqlScripts = await sqlRunner.resolveFiles(sqlPath, config.sql);
    const { pre_sync: preMigrationScripts, post_sync: postMigrationScripts } = config.hooks;

    await db.transaction(async trx => {
      if (preMigrationScripts.length > 0) {
        const preHookScripts = await sqlRunner.resolveFiles(sqlPath, preMigrationScripts);

        logDb('PRE-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(preHookScripts, trx, dbConfig);
        logDb('PRE-SYNC: End');
      }

      // Run the migration scripts.
      await sqlRunner.runSequentially(sqlScripts, trx, dbConfig);

      if (postMigrationScripts.length > 0) {
        const postHookScripts = await sqlRunner.resolveFiles(sqlPath, postMigrationScripts);

        logDb('POST-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSequentially(postHookScripts, trx, dbConfig);
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
 * @param {string[]} files
 * @returns {((dbConfig: Connection) => Promise<void>)}
 */
export function teardown(files: string[]): (dbConfig: Connection) => Promise<void> {
  return async (dbConfig: Connection) => {
    const logDb = dbLogger(dbConfig);

    logDb(`Running rollback on a database: ${dbConfig.id}`);

    const db = createInstance(dbConfig);
    const fileInfoList = files.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${sqlPath}/`, '')));

    await sqlRunner.rollbackSequentially(fileInfoList, db, dbConfig);

    logDb('Finished running rollback');
  };
}

/**
 * Synchronize database.
 *
 * @param {Configuration} syncConfig
 * @param {Connection[]} connections
 * @param {SyncParams} params
 */
export async function synchronize(syncConfig: Configuration, connections: Connection[], params: SyncParams) {
  log('Starting to synchronize.');
  const promises = connections.map(dbConfig => syncDatabase(dbConfig, syncConfig));

  await Promise.all(promises);

  log('Done.');
}

/**
 * Synchronize a specific database.
 *
 * @param {Connection} dbConfig
 * @param {Configuration} syncConfig
 */
async function syncDatabase(dbConfig: Connection, syncConfig: Configuration) {
  const logDb = dbLogger(dbConfig);

  logDb('Synchronize database');

  await teardown(syncConfig.sql)(dbConfig);
  await setup(syncConfig)(dbConfig);
}
