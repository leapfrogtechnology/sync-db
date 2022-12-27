/**
 * SQL source file.
 */
interface SqlCode {
  sql: string;
  name: string;
  dropOnly?: boolean;
}

export default SqlCode;
