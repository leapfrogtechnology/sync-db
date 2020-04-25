import * as Knex from 'knex';

import { log } from './util/logger';
import { getConnectionId } from './config';
import { isKnexInstance, getConfig, createInstance } from './util/db';

import * as init from './init';
import Configuration from './domain/Configuration';
import SynchronizeParams from './domain/SynchronizeParams';

import ConnectionConfig from './domain/ConnectionConfig';
import ConnectionReference from './domain/ConnectionReference';

// Service
import { synchronizeDatabase, pruneDatabase } from './service/sync';
import { executeProcesses } from './service/execution';
import { runMigrateFunc, migrationApiMap } from './service/knexMigrator';
import CommandResult from './domain/CommandResult';
import CommandParams from './domain/CommandParams';

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
  const processes = connections.map(({ connection, id: connectionId }) => () =>
    synchronizeDatabase(connection, {
      config,
      params,
      connectionId,
      migrateFunc: (trx: Knex.Transaction) =>
        runMigrateFunc(
          trx,
          {
            config,
            connectionId,
            params: { ...params, onSuccess: params.onMigrationSuccess, onFailed: params.onMigrationFailed },
            knexMigrationConfig: knexMigrationConfig(connectionId)
          },
          migrationApiMap['migrate.latest']
        )
    })
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

  const processes = connections.map(({ connection, id: connectionId }) => () =>
    pruneDatabase(connection, {
      config,
      params,
      connectionId
    })
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
