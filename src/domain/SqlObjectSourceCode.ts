import SqlCode from './SqlCode';
import SqlFileInfo from './SqlFileInfo';

/**
 * SQL object source code. SQL object here refers to only the supported object types.
 */
interface SqlObjectSourceCode extends SqlCode {
  info: SqlFileInfo;
}

export default SqlObjectSourceCode;
