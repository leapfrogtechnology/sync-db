import * as path from 'path';
import * as yaml from 'yamljs';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import * as fs from './util/fs';
import DbConfig from './domain/DbConfig';
import SyncConfig from './domain/SyncConfig';
import ConnectionConfig from './domain/ConnectionConfig';
import { DEFAULT_CONFIG, CONFIG_FILENAME, CONNECTIONS_FILENAME } from './constants';

/**
 * Load config yaml file.
 *
 * @returns {Promise<SyncConfig>}
 */
export async function loadConfig(): Promise<SyncConfig> {
  log('Resolving sync config file.');

  const filename = path.resolve(process.cwd(), CONFIG_FILENAME);
  const migrations = await yaml.load(filename) as SyncConfig;

  log('Resolved sync config file.');

  const loaded = mergeDeepRight(DEFAULT_CONFIG, migrations) as SyncConfig;

  // TODO: Validate the loaded config.

  return loaded;
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
  const { connections } = JSON.parse(loaded) as DbConfig;

  // TODO: Validate the connections received from file.
  const result = connections.map(connection => ({
    ...connection,
    id: connection.id || `${connection.host}/${connection.database}`
  }));

  log('Resolved connections: %O', result.map(({ id, host, database }) => ({ id, host, database })));

  return result;
}
