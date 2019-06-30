import * as path from 'path';
import * as yaml from 'yamljs';
import { mergeDeepRight } from 'ramda';

import * as fs from './util/fs';
import SyncDbConfig from './domain/SyncDbConfig';
import ConnectionConfig from './domain/ConnectionConfig';

const MIGRATION_FILENAME = 'sync-db.yml';
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
  const filename = path.resolve(process.cwd(), MIGRATION_FILENAME);
  const migrations = (await yaml.load(filename)) as SyncDbConfig;

  return mergeDeepRight(defaults, migrations) as SyncDbConfig;
}

/**
 * Resolve database connections.
 *
 * @returns {Promise<ConnectionConfig[]>}
 */
export async function resolveConnections(): Promise<ConnectionConfig[]> {
  const filename = path.resolve(process.cwd(), CONNECTIONS_FILENAME);
  const loaded = await fs.read(filename);
  const connections = JSON.parse(loaded);

  // TODO: Validate the connections received from file.

  return connections.map((connection: ConnectionConfig) => ({
    ...connection,
    id: connection.id || `${connection.host}/${connection.database}`
  }));
}
