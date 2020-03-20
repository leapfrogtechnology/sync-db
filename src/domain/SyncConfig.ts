import Mapping from './Mapping';

/**
 * Interface for synchronization configuration sycn-db.yml.
 */
interface SyncConfig {
  basePath: string;
  runSequentially: boolean;
  sql: string[];
  hooks: {
    pre_sync: string[];
    post_sync: string[];
  };
  injectedConfig: {
    vars: Mapping<string>;
  };
}

export default SyncConfig;
