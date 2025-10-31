import Mapping from './Mapping';

/**
 * Configuration schema interface.
 */
interface Configuration {
  basePath: string;
  execution: 'parallel' | 'sequential';
  sql: string[];
  connectionResolver: string;
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
    sourceType: 'sql' | 'javascript' | 'typescript';
  };
  manual: {
    directory: string;
    tableName: string;
  };
}

export default Configuration;
