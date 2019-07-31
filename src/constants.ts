/* Global Constants */

import * as path from 'path';

import Configuration from './domain/Configuration';

export const CONFIG_FILENAME = 'sync-db.yml';
export const CONNECTIONS_FILENAME = 'connections.sync-db.json';

export const DEFAULT_CONFIG: Configuration = {
  basePath: path.resolve(process.cwd() + 'src/sql/'),
  sql: [],
  hooks: {
    pre_sync: [],
    post_sync: []
  }
};
