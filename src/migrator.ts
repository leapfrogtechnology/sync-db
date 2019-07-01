import * as path from 'path';

import { log, dbLogger } from './logger';
import * as sqlRunner from './sqlRunner';
import { createInstance } from './util/db';
import SyncDbConfig from './domain/SyncDbConfig';
import ConnectionConfig from './domain/ConnectionConfig';

// const log = debug(SYNC_DB);
const sqlPath = path.resolve(process.cwd(), 'src/sql');

/**
 * Migrate SQL on a database.
 *
 * @param {SyncDbConfig} config
 * @returns {((dbConfig: ConnectionConfig) => Promise<void>)}
 */
export function setup(config: SyncDbConfig): (dbConfig: ConnectionConfig) => Promise<void> {
  return async (dbConfig: ConnectionConfig) => {
    const logDb = dbLogger(dbConfig);

    logDb('Running setup');

    const db = createInstance(dbConfig);
    const sqlScripts = await sqlRunner.resolveFiles(sqlPath, config.sql);
    const { pre_migrate: preMigrationScripts, post_migrate: postMigrationScripts } = config.hooks;

    await db.transaction(async trx => {
      if (preMigrationScripts.length > 0) {
        const preHookScripts = await sqlRunner.resolveFiles(sqlPath, preMigrationScripts);

        logDb('PRE-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSqlSequentially(preHookScripts, trx, dbConfig);
        logDb('PRE-SYNC: End');
      }

      // Run the migration scripts.
      await sqlRunner.runSqlSequentially(sqlScripts, trx, dbConfig);

      if (postMigrationScripts.length > 0) {
        const postHookScripts = await sqlRunner.resolveFiles(sqlPath, postMigrationScripts);

        logDb('POST-SYNC: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSqlSequentially(postHookScripts, trx, dbConfig);
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
 * @returns {((dbConfig: ConnectionConfig) => Promise<void>)}
 */
export function teardown(files: string[]): (dbConfig: ConnectionConfig) => Promise<void> {
  return async (dbConfig: ConnectionConfig) => {
    const logDb = dbLogger(dbConfig);

    logDb(`Running rollback on a database: ${dbConfig.id}`);

    const db = createInstance(dbConfig);
    const fileInfoList = files.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${sqlPath}/`, '')));

    await sqlRunner.rollbackSqlFilesSequentially(fileInfoList, db, dbConfig);

    logDb('Finished running rollback');
  };
}

/**
 * Synchronize.
 *
 * @param {SyncDbConfig} syncConfig
 * @param {ConnectionConfig[]} connections
 */
export async function synchronize(syncConfig: SyncDbConfig, connections: ConnectionConfig[]) {
  log('Starting to synchronize.');
  const promises = connections.map(dbConfig => syncDatabase(dbConfig, syncConfig));

  await Promise.all(promises);

  log('Done.');
}

/**
 * Synchronize a specific database.
 *
 * @param {ConnectionConfig} dbConfig
 * @param {SyncDbConfig} syncConfig
 */
async function syncDatabase(dbConfig: ConnectionConfig, syncConfig: SyncDbConfig) {
  const dbLog = dbLogger(dbConfig);

  dbLog('Synchronize database');

  await teardown(syncConfig.sql)(dbConfig);
  await setup(syncConfig)(dbConfig);
}
