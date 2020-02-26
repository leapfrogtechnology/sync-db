import * as Knex from 'knex';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import SyncResult from './domain/SyncResult';
import { DEFAULT_SYNC_PARAMS } from './constants';
import { mapToConnectionReferences } from './util/db';
import ConnectionConfig from './domain/ConnectionConfig';

// Services
import { synchronizeDatabase } from './services/sync';
import { resolveSourceCode } from './services/sourcecode';

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
  log('Preparing to synchronize.');

  const isCLI = process.env.SYNC_DB_CLI === 'true';
  const connectionList = Array.isArray(conn) ? conn : [conn];
  const connections = mapToConnectionReferences(connectionList);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options);
  const source = await resolveSourceCode(config);
  const promises = connections.map(({ connection, id: connectionId }) =>
    synchronizeDatabase(connection, {
      isCLI,
      config,
      source,
      params,
      connectionId
    })
  );

  log('Starting to synchronize.');

  const results = await Promise.all(promises);

  log('Synchronization completed.');

  return results;
}
