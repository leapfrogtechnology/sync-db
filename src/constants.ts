/* Global Constants */

import Configuration from './domain/Configuration';

export const CONFIG_FILENAME = 'sync-db.yml';
export const CONNECTIONS_FILENAME = 'connections.sync-db.json';

export const DEFAULT_CONFIG: Configuration = {
  sql: [],
  hooks: {
    pre_sync: [],
    post_sync: []
  }
};
