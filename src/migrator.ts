import * as path from 'path';
import * as debug from 'debug';

import { SYNC_DB } from './constants';
import * as sqlRunner from './sqlRunner';
import { createInstance } from './util/db';
import SyncDbConfig from './domain/SyncDbConfig';
import ConnectionConfig from './domain/ConnectionConfig';

const log = debug(SYNC_DB);
const sqlPath = path.resolve(process.cwd(), 'src/sql');

/**
 * Migrate SQL on a database.
 *
 * @param {SyncDbConfig} config
 * @returns {((dbConfig: ConnectionConfig) => Promise<void>)}
 */
export function setup(config: SyncDbConfig): (dbConfig: ConnectionConfig) => Promise<void> {
  return async (dbConfig: ConnectionConfig) => {
    log(`Running migrations on a database: ${dbConfig.database}`);

    const db = createInstance(dbConfig);
    const sqlScripts = await sqlRunner.resolveFiles(sqlPath, config.sql);
    const { pre_migrate: preMigrationScripts, post_migrate: postMigrationScripts } = config.hooks;

    await db.transaction(async trx => {
      if (preMigrationScripts.length > 0) {
        const preHookScripts = await sqlRunner.resolveFiles(sqlPath, preMigrationScripts);

        log('PRE-MIGRATION: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSqlSequentially(preHookScripts, trx, loggerOptions);
        log('PRE-MIGRATION: End');
      }

      // Run the migration scripts.
      await sqlRunner.runSqlSequentially(sqlScripts, trx, loggerOptions);

      if (postMigrationScripts.length > 0) {
        const postHookScripts = await sqlRunner.resolveFiles(sqlPath, postMigrationScripts);

        log('POST-MIGRATION: Begin');
        // Run the pre hook scripts
        await sqlRunner.runSqlSequentially(postHookScripts, trx, loggerOptions);
        log('POST-MIGRATION: End');
      }

      log(`Finished running migrations`);
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
    log(`Running rollback on a database: ${dbConfig.id}`);

    const db = createInstance(dbConfig);
    const fileInfoList = files.map(filePath => sqlRunner.extractSqlFileInfo(filePath.replace(`${sqlPath}/`, '')));

    await sqlRunner.rollbackSqlFilesSequentially(fileInfoList, db, { slug });

    log(`Finished running rollback`);
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
  log('Synchronize database %s', dbConfig.id);

  await teardown(syncConfig.sql)(dbConfig);
  await setup(syncConfig)(dbConfig);
}
