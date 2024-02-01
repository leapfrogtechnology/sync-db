/**
 * SQL source file.
 */
interface SqlCode {
  dropOnly?: boolean;
  name: string;
  sql: string;
}

export default SqlCode;
