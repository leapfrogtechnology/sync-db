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
    // TODO: Only 'sql' is supported sourceType now. JS will be supported later.
    sourceType: 'sql' | 'javascript' | 'typescript';
  };
}

export default Configuration;
