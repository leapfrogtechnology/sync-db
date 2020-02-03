import * as Knex from 'knex';
import * as path from 'path';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import * as fs from './util/fs';
import Connection from './Connection';
import { getConnectionId } from './config';
import SyncParams from './domain/SyncParams';
import SyncConfig from './domain/SyncConfig';
import SyncResult from './domain/SyncResult';
import OclifLogger from './domain/OclifLogger';
import { DEFAULT_SYNC_PARAMS } from './constants';
import SyncDbOptions from './domain/SyncDbOptions';
import { CONNECTIONS_FILENAME } from './constants';
import { resolveConnectionsFromEnv } from './config';
import ConnectionConfig from './domain/ConnectionConfig';
import { synchronizeDatabase } from './services/dbSyncer';

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
  const connections = mapToConnectionInstances(connArr);
  const params = mergeDeepRight(DEFAULT_SYNC_PARAMS, options);
  const cliEnvironment = process.env.SYNC_DB_CLI === 'true';
  const promises = connections.map(connection =>
    synchronizeDatabase(connection.getInstance(), {
      config,
      params,
      cliEnvironment,
      connectionId: getConnectionId(connection.getConfig())
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
 * @returns {Connection[]}
 */
function mapToConnectionInstances(connectionList: (ConnectionConfig | Knex)[]): Connection[] {
  return connectionList.map(con => {
    // TODO: Ask for id in for programmatic API too -
    // when Knex instance is passed directly.
    if (Connection.isKnexInstance(con)) {
      log(`Received connection instance to database: ${con.client.config.connection.database}`);

      return Connection.withKnex(con);
    }

    log(`Received connection config to database: ${con.database}`);

    return new Connection(con);
  });
}
