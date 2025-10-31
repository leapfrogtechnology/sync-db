/**
 * Programmatic API
 * ----------------
 * This module defines the Programmatic API of sync-db.
 * The functions exposed here are used by the CLI frontend and
 * are also meant to be the public interface for the developers using it as a package.
 */

import { Knex } from 'knex';

import * as init from './init';
import { log } from './util/logger';
import { existsDir } from './util/fs';
import { withTransaction, mapToConnectionReferences, DatabaseConnections } from './util/db';

import Configuration from './domain/Configuration';
import { RunScriptParams } from './domain/RunScriptParams';
import SynchronizeParams from './domain/SynchronizeParams';
import ConnectionReference from './domain/ConnectionReference';
import OperationParams from './domain/operation/OperationParams';
import OperationResult from './domain/operation/OperationResult';

// Service
import { executeProcesses } from './service/execution';
import { runSynchronize, runPrune, runScript } from './service/sync';
import {
  getManualScriptPath,
  getMigrationPath,
  invokeMigrationApi,
  KnexMigrationAPI
} from './migration/service/knexMigrator';
import { runScriptWithLog } from './service/sqlRunner';

/**
 * Run scripts for all the configured database connections.
 *
 * @param {Configuration} config
 * @param {DatabaseConnections} conn
 * @param {RunScriptParams} options
 * @returns {Promise<OperationResult[]>}
 */
export async function runScriptAPI(config: Configuration, conn: DatabaseConnections, options?: RunScriptParams) {
  log('Run Script');
  const scriptPath = getManualScriptPath(config);
  const dirExist = await existsDir(scriptPath);

  if (!dirExist) {
    log('Script directory does not exist');
  }

  const params: RunScriptParams = {
    ...options
  };

  const connections = filterConnections(mapToConnectionReferences(conn), params.only);

  const processes = connections.map(connection => () =>
    withTransaction(
      connection,
      trx =>
        runScript(trx, {
          config,
          params,
          connectionId: connection.id,
          migrateFunc: (
            t: Knex.Transaction,
            files: string[],
            connectionId: string,
            runSQLScripts: (t: Knex.Transaction, filteredScript: string[]) => Promise<void>
          ) => runScriptWithLog(t, files, connectionId, config.manual.tableName, runSQLScripts)
        }),
      params['dry-run']
    )
  );

  return executeProcesses(processes, config);
}

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

  const migrationPath = getMigrationPath(config);
  const dirExist = await existsDir(migrationPath);

  if (!dirExist) {
    log('Migration directory does not exist');
  }

  const params: SynchronizeParams = {
    force: false,
    'skip-migration': !dirExist,
    ...options
  };

  const { onStarted: _, ...invokeParams } = params;

  // TODO: Need to preload the SQL source code under this step.
  const { knexMigrationConfig } = await init.prepare(config, {
    migrationPath,
    loadSqlSources: true,
    loadMigrations: !params['skip-migration']
  });

  const connections = filterConnections(mapToConnectionReferences(conn), params.only);
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

  const connections = filterConnections(mapToConnectionReferences(conn), params.only);
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
  const { knexMigrationConfig } = await init.prepare(config, {
    loadMigrations: true,
    migrationPath: getMigrationPath(config)
  });

  const connections = filterConnections(mapToConnectionReferences(conn), params.only);
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
  const { knexMigrationConfig } = await init.prepare(config, {
    loadMigrations: true,
    migrationPath: getMigrationPath(config)
  });

  const connections = filterConnections(mapToConnectionReferences(conn), params.only);
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
  const { knexMigrationConfig } = await init.prepare(config, {
    loadMigrations: true,
    migrationPath: getMigrationPath(config)
  });

  const connections = filterConnections(mapToConnectionReferences(conn), params.only);
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
 * @param {string} [connectionIds]
 * @returns {ConnectionReference[]}
 */
function filterConnections(connections: ConnectionReference[], connectionIds?: string): ConnectionReference[] {
  const trimmedFilterConnectionIds = Array.from(new Set(connectionIds?.split(',').map(id => id.trim())));

  log(`Filter(s) (--only=) ${trimmedFilterConnectionIds}`);

  // Apply no filter if the connection id is not provided.
  if (!connectionIds) {
    log('Running for all connections.');

    return connections;
  }

  const filteredList = connections.filter(connection => trimmedFilterConnectionIds?.includes(connection.id));

  const available = connections.map(({ id }) => id);
  const invalidIds = trimmedFilterConnectionIds.filter(tids => !available.includes(tids));

  if (filteredList.length === 0) {
    throw new Error(
      `No connections found for given id(s) "${trimmedFilterConnectionIds}. Available ids are: ${available}`
    );
  }

  if (invalidIds.length) {
    log(`No connections found for given id(s) "${invalidIds}. Available ids are: ${available}`);
  }

  const filteredConnectionIds = filteredList.map(({ id }) => id);

  log(`Running for a filtered connection(s) (id(s) = ${filteredConnectionIds}).`);

  return filteredList;
}
