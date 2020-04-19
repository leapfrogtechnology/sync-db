import * as Knex from 'knex';
import { mergeDeepRight } from 'ramda';

import { log } from './util/logger';
import { getConnectionId } from './config';
import { DEFAULT_SYNC_PARAMS } from './constants';
import { isKnexInstance, getConfig, createInstance } from './util/db';

import * as init from './init';
import SynchronizeParams from './domain/SynchronizeParams';
import Configuration from './domain/Configuration';
import SyncResult from './domain/SyncResult';
import ConnectionConfig from './domain/ConnectionConfig';
import ConnectionReference from './domain/ConnectionReference';

// Service
import { synchronizeDatabase } from './service/sync';
import { executeProcesses } from './service/execution';
import { runMigrateFunc, migrationApiMap } from './service/knexMigrator';
import { MigrationCommandParams, MigrationResult } from './service/knexMigrator';

/**
 * Synchronize all the configured database connections.
 *
 * @param {Configuration} config
 * @param {(ConnectionConfig[] | ConnectionConfig | Knex[] | Knex)} conn
 * @param {SynchronizeParams} [options]
 * @returns {Promise<SyncResult[]>}
 */
export async function synchronize(
  config: Configuration,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: SynchronizeParams
): Promise<SyncResult[]> {
  log('Synchronize');

  // Note: This does nothing right now.
  // TODO: Need to preload the SQL source code under this step.
  await init.prepare(config, { loadSqlSources: true });

  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const processes = connections.map(({ connection, id: connectionId }) => () =>
    synchronizeDatabase(connection, {
      config,
      params,
      connectionId
    })
  );

  return executeProcesses(processes, config);
}

/**
 * Migrate Latest
 *
 * @param {Configuration} config
 * @param {(ConnectionConfig[] | ConnectionConfig | Knex[] | Knex)} conn
 * @param {MigrationCommandParams} [options]
 * @returns {Promise<MigrationResult[]>}
 */
export async function migrateLatest(
  config: Configuration,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: MigrationCommandParams
): Promise<MigrationResult[]> {
  log('Migrate Latest');

  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(({ connection, id: connectionId }) => () =>
    runMigrateFunc(
      connection,
      {
        config,
        params,
        connectionId,
        knexMigrationConfig: knexMigrationConfig(connectionId)
      },
      migrationApiMap['migrate.latest']
    )
  );

  return executeProcesses(processes, config);
}

/**
 * Migrate Rollback.
 *
 * @param {Configuration} config
 * @param {(ConnectionConfig[] | ConnectionConfig | Knex[] | Knex)} conn
 * @param {MigrationCommandParams} [options]
 * @returns {Promise<MigrationResult[]>}
 */
export async function migrateRollback(
  config: Configuration,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: MigrationCommandParams
): Promise<MigrationResult[]> {
  log('Migrate Rollback');

  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(({ connection, id: connectionId }) => () =>
    runMigrateFunc(
      connection,
      {
        config,
        params,
        connectionId,
        knexMigrationConfig: knexMigrationConfig(connectionId)
      },
      migrationApiMap['migrate.rollback']
    )
  );

  return executeProcesses(processes, config);
}

/**
 * List Migrations.
 *
 * @param {Configuration} config
 * @param {(ConnectionConfig[] | ConnectionConfig | Knex[] | Knex)} conn
 * @param {MigrationCommandParams} [options]
 * @returns {Promise<MigrationResult[]>}
 */
export async function migrateList(
  config: Configuration,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: MigrationCommandParams
): Promise<MigrationResult[]> {
  log('Migrate List');

  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(({ connection, id: connectionId }) => () =>
    runMigrateFunc(
      connection,
      {
        config,
        params,
        connectionId,
        knexMigrationConfig: knexMigrationConfig(connectionId)
      },
      migrationApiMap['migrate.list']
    )
  );

  return executeProcesses(processes, config);
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
