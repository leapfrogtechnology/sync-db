/* Global Constants */

import * as path from 'path';

import SyncConfig from './domain/SyncConfig';
import SyncParams from './domain/SyncParams';

export const CONFIG_FILENAME = 'sync-db.yml';
export const CONNECTIONS_FILENAME = 'connections.sync-db.json';

export const INJECTED_CONFIG_TABLE = '__sync_db_injected_config';
export const DEFAULT_CONFIG: SyncConfig = {
  basePath: path.resolve(process.cwd(), 'src/sql'),
  sql: [],
  hooks: {
    pre_sync: [],
    post_sync: []
  },
  injectedConfig: {
    vars: {}
  }
};

export const DEFAULT_SYNC_PARAMS: SyncParams = {
  force: false,
  onSuccess: (connectionId: string) => null,
  onFailed: (connectionId: string) => null
};

export const ENV_KEYS = ['DB_HOST', 'DB_PASSWORD', 'DB_NAME', 'DB_USERNAME', 'DB_PORT', 'DB_CLIENT', 'DB_ENCRYPTION'];
