import Mapping from './Mapping';

/**
 * Interface for synchronization configuration sycn-db.yml.
 */
interface SyncConfig {
  basePath: string;
  execution: 'parallel' | 'sequential';
  sql: string[];
  hooks: {
    pre_sync: string[];
    post_sync: string[];
  };
  injectedConfig: {
    vars: Mapping<string>;
  };
  migration: {
    directory: string;
    tableName: string;
  };
}

export default SyncConfig;
