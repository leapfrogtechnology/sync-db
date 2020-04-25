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
import CommandResult from './domain/CommandResult';
import CommandParams from './domain/CommandParams';
import SynchronizeParams from './domain/SynchronizeParams';

// Service
import { executeProcesses } from './service/execution';
import { synchronizeDatabase, pruneDatabase } from './service/sync';
import { invokeMigrationApi, migrationApiMap } from './service/knexMigrator';

/**
 * Synchronize all the configured database connections.
 *
 * @param {Configuration} config
 * @param {DatabaseConnections} conn
 * @param {SynchronizeParams} [options]
 * @returns {Promise<CommandResult[]>}
 */
export async function synchronize(
  config: Configuration,
  conn: DatabaseConnections,
  options?: SynchronizeParams
): Promise<CommandResult[]> {
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
  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      synchronizeDatabase(trx, {
        config,
        params,
        connectionId: connection.id,
        migrateFunc: t =>
          invokeMigrationApi(
            t,
            {
              config,
              connectionId: connection.id,
              knexMigrationConfig: knexMigrationConfig(connection.id),
              params: { ...params, onSuccess: params.onMigrationSuccess, onFailed: params.onMigrationFailed }
            },
            migrationApiMap['migrate.latest']
          )
      })
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
 * @param {CommandParams} [options]
 * @returns {Promise<CommandResult[]>}
 */
export async function prune(
  config: Configuration,
  conn: DatabaseConnections,
  options?: CommandParams
): Promise<CommandResult[]> {
  log('Prune');

  const params: CommandParams = { ...options };
  const connections = mapToConnectionReferences(conn);

  // TODO: Need to preload the SQL source code under this step.
  await init.prepare(config, { loadSqlSources: true });

  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      pruneDatabase(trx, {
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
 * @param {CommandParams} [options]
 * @returns {Promise<CommandResult[]>}
 */
export async function migrateLatest(
  config: Configuration,
  conn: DatabaseConnections,
  options?: CommandParams
): Promise<CommandResult[]> {
  log('Migrate Latest');

  const params: CommandParams = { ...options };
  const connections = mapToConnectionReferences(conn);
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      invokeMigrationApi(
        trx,
        {
          config,
          params,
          connectionId: connection.id,
          knexMigrationConfig: knexMigrationConfig(connection.id)
        },
        migrationApiMap['migrate.latest']
      )
    )
  );

  return executeProcesses(processes, config);
}

/**
 * Migrate Rollback.
 *
 * @param {Configuration} config
 * @param {(DatabaseConnections)} conn
 * @param {CommandParams} [options]
 * @returns {Promise<CommandResult[]>}
 */
export async function migrateRollback(
  config: Configuration,
  conn: DatabaseConnections,
  options?: CommandParams
): Promise<CommandResult[]> {
  log('Migrate Rollback');

  const params: CommandParams = { ...options };
  const connections = mapToConnectionReferences(conn);
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      invokeMigrationApi(
        trx,
        {
          config,
          params,
          connectionId: connection.id,
          knexMigrationConfig: knexMigrationConfig(connection.id)
        },
        migrationApiMap['migrate.rollback']
      )
    )
  );

  return executeProcesses(processes, config);
}

/**
 * List Migrations.
 *
 * @param {Configuration} config
 * @param {(DatabaseConnections)} conn
 * @param {CommandParams} [options]
 * @returns {Promise<CommandResult[]>}
 */
export async function migrateList(
  config: Configuration,
  conn: DatabaseConnections,
  options?: CommandParams
): Promise<CommandResult[]> {
  log('Migrate List');

  const params: CommandParams = { ...options };
  const connections = mapToConnectionReferences(conn);
  const { knexMigrationConfig } = await init.prepare(config, { loadMigrations: true });

  const processes = connections.map(connection => () =>
    withTransaction(connection, trx =>
      invokeMigrationApi(
        trx,
        {
          config,
          params,
          connectionId: connection.id,
          knexMigrationConfig: knexMigrationConfig(connection.id)
        },
        migrationApiMap['migrate.list']
      )
    )
  );

  return executeProcesses(processes, config);
}
