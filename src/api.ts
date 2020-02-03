import * as Knex from 'knex';
import * as path from 'path';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import * as fs from './util/fs';
import { getConnectionId } from './config';
import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import SyncResult from './domain/SyncResult';
import OclifLogger from './domain/OclifLogger';
import { DEFAULT_SYNC_PARAMS } from './constants';
import SyncDbOptions from './domain/SyncDbOptions';
import { CONNECTIONS_FILENAME } from './constants';
import { resolveConnectionsFromEnv } from './config';
import { isKnexInstance, getConfig } from './util/db';
import ConnectionConfig from './domain/ConnectionConfig';
import { synchronizeDatabase } from './services/dbSyncer';
import ConnectionReference from './domain/ConnectionReference';

/**
 * Generates connections.sync-db.json file.
 *
 * @param {OclifLogger} logger
 * @returns {Promise<void>}
 */
async function generateConnection(logger: OclifLogger): Promise<void> {
  try {
    const filePath = path.resolve(process.cwd(), CONNECTIONS_FILENAME);

    const connections = resolveConnectionsFromEnv();
    const contents = JSON.stringify({ connections });
    await fs.write(filePath, contents);

    logger.info(`Generated file: ${CONNECTIONS_FILENAME}`);
  } catch (error) {
    logger.error(error, { exit: false });
    process.exit(-1);
  }
}

/**
 * Services to run depending upon the flags provided.
 *
 * @param {SyncDbOptions} flags
 * @param {Logger} logger
 * @returns {Promise<void>}
 */
export async function handleFlags(flags: SyncDbOptions, logger: OclifLogger): Promise<void> {
  if (flags['generate-connections']) {
    await generateConnection(logger);
    process.exit(0);
  }
}

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

  const connArr = Array.isArray(conn) ? conn : [conn];
  const connections = mapToConnectionReferences(connArr);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options);
  const cliEnvironment = process.env.SYNC_DB_CLI === 'true';
  const promises = connections.map(({ connection, id }) =>
    synchronizeDatabase(connection, {
      config,
      params,
      cliEnvironment,
      connectionId: id || getConnectionId(getConfig(connection))
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
  return connectionList.map(connection => {
    if (isKnexInstance(connection)) {
      log(`Received connection instance to database: ${connection.client.config.connection.database}`);

      // TODO: Ask for `id` explicitly in for programmatic API,
      // when Knex instance is passed directly.
      // This implies a breaking change with the programmatic API.
      return { connection, id: undefined };
    }

    log(`Received connection config to database: ${connection.database}`);

    return { connection: Knex(connection), id: connection.id };
  });
}
