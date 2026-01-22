/**
 * Interpolate a given template string by filling the placeholders with the params.
 *
 * Placeholder syntax:
 *  {{name}}
 *
 * @example
 * interpolate('<div>{{text}}</div>', {text: 'Hello World!'})
 *  => '<div>Hello World!</div>'
 *
 * @param {string} template
 * @param {*} [params={}]
 * @returns {string}
 */
export function interpolate(template: string, params: any = {}): string {
  if (!params || !Object.keys(params)) {
    return template;
  }

  let result = template;

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    result = result.replace(new RegExp('{{' + key + '}}', 'g'), `${value}`);
  }

  return result;
}

/**
 * Converts CREATE statements to CREATE OR REPLACE/ALTER for supported object types.
 * Supports: VIEW, FUNCTION, PROCEDURE
 * - PostgreSQL/MySQL/Oracle: Uses CREATE OR REPLACE
 * - MSSQL: Uses CREATE OR ALTER (SQL Server 2016+)
 *
 * @param {string} sql - The SQL content to modify
 * @param {string} [dbClient] - Database client type ('pg', 'mssql', 'mysql', 'oracledb')
 * @returns {string} - Modified SQL with CREATE OR REPLACE/ALTER syntax
 */
export function convertToCreateOrReplace(sql: string, dbClient?: string): string {
  if (!sql || typeof sql !== 'string') {
    return sql;
  }

  // Determine if we should use ALTER (MSSQL) or REPLACE (others)
  const isMssql = dbClient === 'mssql' || dbClient === 'tedious';
  const keyword = isMssql ? 'ALTER' : 'REPLACE';

  // Pattern to match CREATE [object_type] with optional OR REPLACE/ALTER
  // Handles: CREATE VIEW, CREATE FUNCTION, CREATE PROCEDURE
  // Case insensitive and handles whitespace variations
  const createPattern = /\bCREATE(\s+OR\s+(REPLACE|ALTER))?\s+(VIEW|FUNCTION|PROCEDURE)\b/gi;

  const modifiedSql = sql.replace(createPattern, (match, orClause, replaceOrAlter, objectType) => {
    // If OR REPLACE or OR ALTER already exists, keep it as is
    if (orClause) {
      return match;
    }

    // Use CREATE OR ALTER for MSSQL, CREATE OR REPLACE for others
    return `CREATE OR ${keyword} ${objectType.toUpperCase()}`;
  });

  return modifiedSql;
}
