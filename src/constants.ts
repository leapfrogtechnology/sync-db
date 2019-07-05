/* Global Constants */

import SyncDbConfig from './domain/SyncDbConfig';

export const CONFIG_FILENAME = 'sync-db.yml';
export const CONNECTIONS_FILENAME = 'connections.sync-db.json';

export const DEFAULT_CONFIG: SyncDbConfig = {
  sql: [],
  hooks: {
    pre_migrate: [],
    post_migrate: []
  }
};
