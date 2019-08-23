/* Global Constants */

import * as path from 'path';

import SyncConfig from './domain/SyncConfig';

export const CONFIG_FILENAME = 'sync-db.yml';
export const CONNECTIONS_FILENAME = 'connections.sync-db.json';

export const DEFAULT_CONFIG: SyncConfig = {
  basePath: path.resolve(process.cwd(), 'src/sql'),
  sql: [],
  hooks: {
    pre_sync: [],
    post_sync: []
  }
};
