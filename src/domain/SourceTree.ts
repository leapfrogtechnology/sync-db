import SqlCode from './SqlCode';
import SqlObjectSourceCode from './SqlObjectSourceCode';

/**
 * A structure representing the files resolved from the whole codebase.
 */
interface SourceTree {
  sql: SqlObjectSourceCode[];
  hooks: {
    preSync: SqlCode[];
    postSync: SqlCode[];
  };
}

export default SourceTree;
