import * as Knex from 'knex';
import { mergeDeepRight } from 'ramda';

import { log } from './util/logger';
import { getConnectionId } from './config';
import { DEFAULT_SYNC_PARAMS } from './constants';
import { isKnexInstance, getConfig, createInstance } from './util/db';

import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import SyncResult from './domain/SyncResult';
import ConnectionConfig from './domain/ConnectionConfig';
import ConnectionReference from './domain/ConnectionReference';

// Services
import { synchronizeDatabase } from './service/sync';
import { executeProcesses } from './service/execution';
import { MigrationCommandParams, MigrationResult } from './service/knexMigrator';
import { runMigrateFunc, resolveKnexMigrationConfig, migrationApiMap } from './service/knexMigrator';

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

  return executeProcesses(processes, config);
}

export async function migrateLatest(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: MigrationCommandParams
): Promise<MigrationResult[]> {
  log('Starting to migrate.');
  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const knexMigrationConfig = await resolveKnexMigrationConfig(config);

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

export async function migrateRollback(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: MigrationCommandParams
): Promise<MigrationResult[]> {
  log('Starting to migrate.');
  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const knexMigrationConfig = await resolveKnexMigrationConfig(config);

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

export async function migrateList(
  config: SyncConfig,
  conn: ConnectionConfig[] | ConnectionConfig | Knex[] | Knex,
  options?: MigrationCommandParams
): Promise<MigrationResult[]> {
  const connections = mapToConnectionReferences(conn);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options || {});
  const knexMigrationConfig = await resolveKnexMigrationConfig(config);

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
