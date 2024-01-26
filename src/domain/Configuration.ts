import Mapping from './Mapping';

/**
 * Configuration schema interface.
 */
interface Configuration {
  basePath: string;
  connectionResolver: string;
  execution: 'parallel' | 'sequential';
  hooks: {
    post_sync: string[];
    pre_sync: string[];
  };
  injectedConfig: {
    vars: Mapping<string>;
  };
  migration: {
    directory: string;
    sourceType: 'javascript' | 'sql' | 'typescript';
    tableName: string;
  };
  sql: string[];
}

export default Configuration;
