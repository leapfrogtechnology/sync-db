import Mapping from './Mapping';

/**
 * Interface for synchronization configuration sycn-db.yml.
 */
interface SyncConfig {
  basePath: string;
  sql: string[];
  hooks: {
    pre_sync: string[];
    post_sync: string[];
  };
  injectedConfig: {
    table: string;
    variables: Mapping<string>;
  };
}

export default SyncConfig;
