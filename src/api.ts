import * as Knex from 'knex';
import * as path from 'path';
import { mergeDeepRight } from 'ramda';

import { log } from './util/logger';
import { getConnectionId } from './config';
import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import SyncResult from './domain/SyncResult';
import { DEFAULT_SYNC_PARAMS } from './constants';

import ConnectionConfig from './domain/ConnectionConfig';
import ConnectionReference from './domain/ConnectionReference';
import { isKnexInstance, getConfig, createInstance } from './util/db';

// Services
import { synchronizeDatabase } from './service/sync';
import { executeProcesses } from './service/execution';
import * as migratorService from './service/migrator';
import SqlMigrationContext from './migration/SqlMigrationContext';
import KnexMigrationSource from './migration/KnexMigrationSource';
import { MigrationListResult, MigrationListParams } from './service/migrator';

/**
 * Synchronize all the configured database connections.
 *
 * @param {SyncConfig} config
 * @param {(ConnectionConfig[] | ConnectionConfig | Knex[] | Knex)} conn
 * @param {SyncParams} [options]
 * @returns {Promise<SyncResult[]>}
 */
export async function synchronize(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: SyncParams
): Promise<SyncResult[]> {
  log('Starting to synchronize.');
  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const processes = connections.map(({ connection, id: connectionId }) => () =>
    synchronizeDatabase(connection, {
      config,
      params,
      connectionId
    })
  );

  // Explicitly suppressing the `| Error` type since
  // all errors are already caught inside synchronizeDatabase().
  const results = (await executeProcesses(processes, config)) as SyncResult[];

  log('Synchronization completed.');

  return results;
}

export async function migrateLatest(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: SyncParams
): Promise<SyncResult[]> {
  log('Starting to migrate.');
  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});

  const { basePath, migration } = config;
  const migrationPath = path.join(basePath, migration.directory);
  const migrations = await migratorService.resolveSqlMigrations(migrationPath);

  log('Migration Path:', migrationPath);
  log('Available migrations:');
  log('%O', migrations);

  // TODO: We'll need to support different types of migrations eg both sql & js
  // For instance migrations in JS would have different context like JavaScriptMigrationContext.
  const getMigrationContext = (connectionId: string) => new SqlMigrationContext(connectionId, migrations);

  const processes = connections.map(({ connection, id: connectionId }) => () =>
    migratorService.migrateLatest(connection, {
      config,
      params,
      connectionId,
      knexMigrationConfig: {
        tableName: config.migration.tableName,
        migrationSource: new KnexMigrationSource(getMigrationContext(connectionId))
      }
    })
  );

  const results = await executeProcesses(processes, config);

  log('Migrations completed.');

  return results;
}

export async function migrateRollback(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: SyncParams
): Promise<SyncResult[]> {
  log('Starting to migrate.');
  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});

  const { basePath, migration } = config;
  const migrationPath = path.join(basePath, migration.directory);
  const migrations = await migratorService.resolveSqlMigrations(migrationPath);

  log('Migration Path:', migrationPath);
  log('Available migrations:');
  log('%O', migrations);

  // TODO: We'll need to support different types of migrations eg both sql & js
  // For instance migrations in JS would have different context like JavaScriptMigrationContext.
  const getMigrationContext = (connectionId: string) => new SqlMigrationContext(connectionId, migrations);

  const processes = connections.map(({ connection, id: connectionId }) => () =>
    migratorService.migrateRollback(connection, {
      config,
      params,
      connectionId,
      knexMigrationConfig: {
        tableName: config.migration.tableName,
        migrationSource: new KnexMigrationSource(getMigrationContext(connectionId))
      }
    })
  );

  const results = await executeProcesses(processes, config);

  log('Migrations completed.');

  return results;
}

export async function migrateList(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: MigrationListParams
): Promise<MigrationListResult[]> {
  log('Starting to migrate.');
  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});

  const { basePath, migration } = config;
  const migrationPath = path.join(basePath, migration.directory);
  const migrations = await migratorService.resolveSqlMigrations(migrationPath);

  log('Migration Path:', migrationPath);
  log('Available migrations:');
  log('%O', migrations);

  // TODO: We'll need to support different types of migrations eg both sql & js
  // For instance migrations in JS would have different context like JavaScriptMigrationContext.
  const getMigrationContext = (connectionId: string) => new SqlMigrationContext(connectionId, migrations);

  const processes = connections.map(({ connection, id: connectionId }) => () =>
    migratorService.migrateList(connection, {
      config,
      params,
      connectionId,
      knexMigrationConfig: {
        tableName: config.migration.tableName,
        migrationSource: new KnexMigrationSource(getMigrationContext(connectionId))
      }
    })
  );

  const results = await executeProcesses(processes, config);

  log('Migrations completed.');

  return results;
}

/**
 * Map user provided connection(s) to the connection instances.
 *
 * @param {(ConnectionConfig[] | ConnectionConfig | Knex[] | Knex)} conn
 * @returns {ConnectionReference[]}
 */
function mapToConnectionReferences(conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex): ConnectionReference[] {
  const connectionList = Array.isArray(conn) ? conn : [conn];

  return connectionList.map(connection => {
    if (isKnexInstance(connection)) {
      log(`Received connection instance to database: ${connection.client.config.connection.database}`);

      // TODO: Ask for `id` explicitly in for programmatic API,
      // when Knex instance is passed directly.
      // This implies a breaking change with the programmatic API.
      return { connection, id: getConnectionId(getConfig(connection)) };
    }

    log(`Creating a connection to database: ${connection.host}/${connection.database}`);

    return { connection: createInstance(connection), id: getConnectionId(connection) };
  });
}
