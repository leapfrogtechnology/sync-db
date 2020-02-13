import * as Knex from 'knex';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import { getConnectionId } from './config';
import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import SyncResult from './domain/SyncResult';
import { DEFAULT_SYNC_PARAMS } from './constants';
import { isKnexInstance, getConfig } from './util/db';
import ConnectionConfig from './domain/ConnectionConfig';
import { synchronizeDatabase } from './services/dbSyncer';
import ConnectionReference from './domain/ConnectionReference';

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

  const connectionList = Array.isArray(conn) ? conn : [conn];
  const connections = mapToConnectionReferences(connectionList);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options);
  const cliEnvironment = process.env.SYNC_DB_CLI === 'true';
  const promises = connections.map(({ connection, id: connectionId }) =>
    synchronizeDatabase(connection, {
      config,
      params,
      connectionId,
      cliEnvironment
    })
  );

  const result = await Promise.all(promises);

  log('Finished all');

  return result;
}

/**
 * Map connection configuration list to the connection instances.
 *
 * @param {((ConnectionConfig | Knex)[])} connectionList
 * @returns {ConnectionReference[]}
 */
function mapToConnectionReferences(connectionList: (ConnectionConfig | Knex)[]): ConnectionReference[] {
  return connectionList
    .map(connection => {
      if (isKnexInstance(connection)) {
        log(`Received connection instance to database: ${connection.client.config.connection.database}`);

        // TODO: Ask for `id` explicitly in for programmatic API,
        // when Knex instance is passed directly.
        // This implies a breaking change with the programmatic API.
        return { connection, id: undefined };
      }

      log(`Received connection config to database: ${connection.database}`);

      return { connection: Knex(connection), id: connection.id };
    })
    .map(({ connection, id }) => ({ connection, id: id || getConnectionId(getConfig(connection)) }));
}
