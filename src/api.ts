/**
 * Programmatic API
 * ----------------
 * This module defines the Programmatic API of sync-db.
 * The functions exposed here are used by the CLI frontend and
 * are also meant to be the public interface for the developers using it as a package.
 */

import * as init from './init';
import { log } from './util/logger';
import { withTransaction, mapToConnectionReferences, DatabaseConnections } from './util/db';

import Configuration from './domain/Configuration';
import SynchronizeParams from './domain/SynchronizeParams';
import OperationParams from './domain/operation/OperationParams';
import OperationResult from './domain/operation/OperationResult';

// Service
import { executeProcesses } from './service/execution';
import { runSynchronize, runPrune } from './service/sync';
import { invokeMigrationApi, KnexMigrationAPI } from './migration/service/knexMigrator';
import ConnectionReference from './domain/ConnectionReference';
import { fmap } from './util/list';

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

  const params: SynchronizeParams = {
    force: false,
    'skip-migration': false,
    ...options
  };

  // TODO: Need to preload the SQL source code under this step.
  const { knexMigrationConfig } = await init.prepare(config, {
    loadSqlSources: true,
    loadMigrations: !params['skip-migration']
  });

  const connections = mapToConnectionReferences(conn);
  const processes = fmap(connections, filterConnectionBy(params.only), connection => () =>
    withTransaction(connection, trx =>
      runSynchronize(trx, {
        config,
        params,
        connectionId: connection.id,
        migrateFunc: t =>
          invokeMigrationApi(t, KnexMigrationAPI.MIGRATE_LATEST, {
            config,
            connectionId: connection.id,
            knexMigrationConfig: knexMigrationConfig(connection.id),
            params: { ...params, onSuccess: params.onMigrationSuccess, onFailed: params.onMigrationFailed }
          })
      })
    )
  );

  ensureFilterApplied(processes, params.only);

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
  const connections = mapToConnectionReferences(conn);

  // TODO: Need to preload the SQL source code under this step.
  await init.prepare(config, { loadSqlSources: true });

  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      runPrune(trx, {
        config,
        params,
        connectionId: connection.id
      })
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
  const connections = mapToConnectionReferences(conn);
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      invokeMigrationApi(trx, KnexMigrationAPI.MIGRATE_LATEST, {
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
  const connections = mapToConnectionReferences(conn);
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      invokeMigrationApi(trx, KnexMigrationAPI.MIGRATE_ROLLBACK, {
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
  const connections = mapToConnectionReferences(conn);
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

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
 * Checks if the connection filter
 *
 * @param {string} [connectionId]
 * @returns {(item: any) => boolean}
 */
function filterConnectionBy(connectionId?: string): (item: any) => boolean {
  // Apply filter for the specific connection id that matches.
  if (connectionId) {
    return (connection: ConnectionReference) => connection.id === connectionId;
  }

  // If connectionId is not provided - apply no filter.
  return () => true;
}

/**
 * Ensure the --only filter is applied correctly.
 *
 * @param {any[]} processes
 * @param {string} [only]
 */
function ensureFilterApplied(processes: any[], only?: string) {
  // Validate list when filter applied with --only=CONNECTION_ID.
  if (only && processes.length === 0) {
    throw new Error(`No connections found for givenid "${only}.`);
  }

  if (only) {
    log(`Running for a single connection (id = ${only}).`);
  } else {
    log('Running for all connections.');
  }
}
