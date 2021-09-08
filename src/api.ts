/**
 * Programmatic API
 * ----------------
 * This module defines the Programmatic API of sync-db.
 * The functions exposed here are used by the CLI frontend and
 * are also meant to be the public interface for the developers using it as a package.
 */

import * as init from './init';
import { log } from './util/logger';
import { existDirectory } from './util/fs';
import { withTransaction, mapToConnectionReferences, DatabaseConnections } from './util/db';

import Configuration from './domain/Configuration';
import SynchronizeParams from './domain/SynchronizeParams';
import ConnectionReference from './domain/ConnectionReference';
import OperationParams from './domain/operation/OperationParams';
import OperationResult from './domain/operation/OperationResult';

// Service
import { executeProcesses } from './service/execution';
import { runSynchronize, runPrune } from './service/sync';
import { getMigrationPath, invokeMigrationApi, KnexMigrationAPI } from './migration/service/knexMigrator';

/**
 * Synchronize all the configured database connections.
 *
 * @param {Configuration} config
 * @param {DatabaseConnections} conn
 * @param {SynchronizeParams} [options]
 * @returns {Promise<OperationResult[]>}
 */
export async function synchronize(
  config: Configuration,
  conn: DatabaseConnections,
  options?: SynchronizeParams
): Promise<OperationResult[]> {
  log('Synchronize');

  let params: SynchronizeParams = {
    force: false,
    'skip-migration': false,
    ...options
  };
  const { onStarted: _, ...invokeParams } = params;

  const migrationPath = getMigrationPath(config);
  const dirExist = await existDirectory(migrationPath);

  // TODO: Need to preload the SQL source code under this step.
  const { knexMigrationConfig } = await init.prepare(config, {
    loadSqlSources: true,
    loadMigrations: !params['skip-migration']
  });

  if (!dirExist) {
    params = {
      ...params,
      'skip-migration': true
    };
  }

  const connections = filterConnectionsAsRequired(mapToConnectionReferences(conn), params.only);
  const processes = connections.map(connection => () =>
    withTransaction(
      connection,
      trx =>
        runSynchronize(trx, {
          config,
          params,
          connectionId: connection.id,
          migrateFunc: t =>
            invokeMigrationApi(t, KnexMigrationAPI.MIGRATE_LATEST, {
              config,
              connectionId: connection.id,
              knexMigrationConfig: knexMigrationConfig(connection.id),
              params: { ...invokeParams, onSuccess: params.onMigrationSuccess, onFailed: params.onMigrationFailed }
            })
        }),
      params['dry-run']
    )
  );

  return executeProcesses(processes, config);
}

/**
 * Prune all synchronized objects from the databases (except the ones like tables made via migrations).
 *
 * TODO: An ability to prune only a handful of objects from the last.
 *
 * @param {Configuration} config
 * @param {(DatabaseConnections)} conn
 * @param {OperationParams} [options]
 * @returns {Promise<OperationResult[]>}
 */
export async function prune(
  config: Configuration,
  conn: DatabaseConnections,
  options?: OperationParams
): Promise<OperationResult[]> {
  log('Prune');

  const params: OperationParams = { ...options };

  // TODO: Need to preload the SQL source code under this step.
  await init.prepare(config, { loadSqlSources: true });

  const connections = filterConnectionsAsRequired(mapToConnectionReferences(conn), params.only);
  const processes = connections.map(connection => () =>
    withTransaction(
      connection,
      trx =>
        runPrune(trx, {
          config,
          params,
          connectionId: connection.id
        }),
      params['dry-run']
    )
  );

  return executeProcesses(processes, config);
}

/**
 * Migrate Latest.
 *
 * @param {Configuration} config
 * @param {(DatabaseConnections)} conn
 * @param {OperationParams} [options]
 * @returns {Promise<OperationResult[]>}
 */
export async function migrateLatest(
  config: Configuration,
  conn: DatabaseConnections,
  options?: OperationParams
): Promise<OperationResult[]> {
  log('Migrate Latest');

  const params: OperationParams = { ...options };
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const connections = filterConnectionsAsRequired(mapToConnectionReferences(conn), params.only);
  const processes = connections.map(connection => () =>
    withTransaction(
      connection,
      trx =>
        invokeMigrationApi(trx, KnexMigrationAPI.MIGRATE_LATEST, {
          config,
          params,
          connectionId: connection.id,
          knexMigrationConfig: knexMigrationConfig(connection.id)
        }),
      params['dry-run']
    )
  );

  return executeProcesses(processes, config);
}

/**
 * Migrate Rollback.
 *
 * @param {Configuration} config
 * @param {(DatabaseConnections)} conn
 * @param {OperationParams} [options]
 * @returns {Promise<OperationResult[]>}
 */
export async function migrateRollback(
  config: Configuration,
  conn: DatabaseConnections,
  options?: OperationParams
): Promise<OperationResult[]> {
  log('Migrate Rollback');

  const params: OperationParams = { ...options };
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const connections = filterConnectionsAsRequired(mapToConnectionReferences(conn), params.only);
  const processes = connections.map(connection => () =>
    withTransaction(
      connection,
      trx =>
        invokeMigrationApi(trx, KnexMigrationAPI.MIGRATE_ROLLBACK, {
          config,
          params,
          connectionId: connection.id,
          knexMigrationConfig: knexMigrationConfig(connection.id)
        }),
      params['dry-run']
    )
  );

  return executeProcesses(processes, config);
}

/**
 * List Migrations.
 *
 * @param {Configuration} config
 * @param {(DatabaseConnections)} conn
 * @param {OperationParams} [options]
 * @returns {Promise<OperationResult[]>}
 */
export async function migrateList(
  config: Configuration,
  conn: DatabaseConnections,
  options?: OperationParams
): Promise<OperationResult[]> {
  log('Migrate List');

  const params: OperationParams = { ...options };
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const connections = filterConnectionsAsRequired(mapToConnectionReferences(conn), params.only);
  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      invokeMigrationApi(trx, KnexMigrationAPI.MIGRATE_LIST, {
        config,
        params,
        connectionId: connection.id,
        knexMigrationConfig: knexMigrationConfig(connection.id)
      })
    )
  );

  return executeProcesses(processes, config);
}

/**
 * Check the filter condition and apply filter if required.
 *
 * @param {ConnectionReference[]} connections
 * @param {string} [filterConnectionId]
 * @returns {ConnectionReference[]}
 */
function filterConnectionsAsRequired(
  connections: ConnectionReference[],
  filterConnectionId?: string
): ConnectionReference[] {
  log(`Filter (--only=) ${filterConnectionId}`);

  // Apply no filter if the connection id is not provided.
  if (!filterConnectionId) {
    log('Running for all connections.');

    return connections;
  }

  const filteredList = connections.filter(connection => connection.id === filterConnectionId);

  if (filteredList.length === 0) {
    const available = connections.map(({ id }) => id);

    throw new Error(`No connections found for given id "${filterConnectionId}. Available ids are: ${available}`);
  }

  log(`Running for a single connection (id = ${filterConnectionId}).`);

  return filteredList;
}
