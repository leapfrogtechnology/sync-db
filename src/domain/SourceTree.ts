import SqlCode from './SqlCode';

/**
 * A structure representing the files resolved from the whole codebase.
 */
interface SourceTree {
  sql: SqlCode[];
  hooks: {
    preSync: SqlCode[];
    postSync: SqlCode[];
  };
}

export default SourceTree;
