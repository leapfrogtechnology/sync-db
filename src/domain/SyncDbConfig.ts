/**
 * Database synchronization configuration.
 */
interface SyncDbConfig {
  sql: string[];
  hooks: {
    pre_migrate: string[];
    post_migrate: string[];
  };
}

export default SyncDbConfig;
