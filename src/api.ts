import * as Knex from 'knex';

import * as init from './init';
import { log } from './util/logger';
import { getConnectionId } from './config';
import { isKnexInstance, getConfig, createInstance, withTransaction } from './util/db';

import Configuration from './domain/Configuration';
import CommandResult from './domain/CommandResult';
import CommandParams from './domain/CommandParams';
import ConnectionConfig from './domain/ConnectionConfig';
import SynchronizeParams from './domain/SynchronizeParams';
import ConnectionReference from './domain/ConnectionReference';

// Service
import { executeProcesses } from './service/execution';
import { synchronizeDatabase, pruneDatabase } from './service/sync';
import { invokeMigrationApi, migrationApiMap } from './service/knexMigrator';

/**
 * Database connections given by the user or the CLI frontend.
 */
export type DatabaseConnections = ConnectionConfig[] | ConnectionConfig | Knex[] | Knex;

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
  await init.prepare(config, {});

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

/**
 * Map user provided connection(s) to the connection instances.
 *
 * @param {(DatabaseConnections)} conn
 * @returns {ConnectionReference[]}
 */
function mapToConnectionReferences(conn: DatabaseConnections): ConnectionReference[] {
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
