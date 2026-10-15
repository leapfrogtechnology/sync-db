/* Global Constants */

import Configuration from './domain/Configuration';

// General constants
export const NS_PER_SEC = 1e9;

// SyncDb specific constants
export const CONFIG_FILENAME = 'sync-db.yml';
export const CONNECTIONS_FILENAME = 'connections.sync-db.json';

// Maximum number of connections processed at the same time with the `parallel` execution strategy.
export const DEFAULT_CONCURRENCY = 10;

// Maximum number of SQL files read from the disk at the same time.
export const MAX_CONCURRENT_FILE_READS = 64;

// Maximum number of DROP statements sent to the database in a single batch.
export const DROP_BATCH_SIZE = 50;

export const INJECTED_CONFIG_TABLE = '__sync_db_injected_config';
export const DEFAULT_CONFIG: Configuration = {
  basePath: 'src',
  connectionResolver: '',
  execution: 'parallel',
  sql: [],
  hooks: {
    pre_sync: [],
    post_sync: []
  },
  injectedConfig: {
    vars: {}
  },
  migration: {
    directory: 'migration',
    tableName: 'knex_migrations', // Note: This is Knex's default value. Just keeping it same.
    sourceType: 'sql'
  }
};

export const REQUIRED_ENV_KEYS = ['DB_HOST', 'DB_PASSWORD', 'DB_NAME', 'DB_USERNAME', 'DB_PORT', 'DB_CLIENT'];

export const DROP_ONLY_OBJECT_TERMINATOR = '.drop';
