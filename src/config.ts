import * as path from 'path';
import * as yaml from 'yamljs';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import * as fs from './util/fs';
import SyncDbConfig from './domain/SyncDbConfig';
import ConnectionConfig from './domain/ConnectionConfig';
import { DEFAULT_CONFIG, CONFIG_FILENAME, CONNECTIONS_FILENAME } from './constants';

/**
 * Load config yaml file.
 *
 * @returns {Promise<SyncDbConfig>}
 */
export async function loadConfig(): Promise<SyncDbConfig> {
  log('Resolving sync config file.');

  const filename = path.resolve(process.cwd(), CONFIG_FILENAME);
  const migrations = (await yaml.load(filename)) as SyncDbConfig;

  log('Resolved sync config file.');

  return mergeDeepRight(DEFAULT_CONFIG, migrations) as SyncDbConfig;
}

/**
 * Resolve database connections.
 *
 * @returns {Promise<ConnectionConfig[]>}
 */
export async function resolveConnections(): Promise<ConnectionConfig[]> {
  log('Resolving database connections.');

  const filename = path.resolve(process.cwd(), CONNECTIONS_FILENAME);

  log('Resolving file: %s', filename);

  const loaded = await fs.read(filename);
  const connections = JSON.parse(loaded);

  log('Connections parsed: %o', connections);

  // TODO: Validate the connections received from file.

  const result = connections.map((connection: ConnectionConfig) => ({
    ...connection,
    id: connection.id || `${connection.host}/${connection.database}`
  }));

  log('Resolved connections: %O', connections);

  return result;
}
