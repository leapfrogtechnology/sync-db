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
    // TODO: Only 'sql' is supported sourceType now. JS will be supported later.
    sourceType: 'sql' | 'javascript';
  };
}

export default SyncConfig;
