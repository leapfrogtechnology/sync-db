import * as path from 'path';
import * as yaml from 'yamljs';
import { mergeDeepRight } from 'ramda';

import { log } from './logger';
import * as fs from './util/fs';
import SyncDbConfig from './domain/SyncDbConfig';
import ConnectionConfig from './domain/ConnectionConfig';

const SYNC_CONFIG_FILENAME = 'sync-db.yml';
const CONNECTIONS_FILENAME = 'connections.sync-db.json';

/**
 * Load migration config yaml file.
 *
 * @returns {Promise<SyncDbConfig>}
 */
export async function load(): Promise<SyncDbConfig> {
  const defaults: SyncDbConfig = {
    sql: [],
    hooks: {
      pre_migrate: [],
      post_migrate: []
    }
  };

  log('Resolving sync config file.');

  const filename = path.resolve(process.cwd(), SYNC_CONFIG_FILENAME);
  const migrations = (await yaml.load(filename)) as SyncDbConfig;

  log('Resolved sync config file.');

  return mergeDeepRight(defaults, migrations) as SyncDbConfig;
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
