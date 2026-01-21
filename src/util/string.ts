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
 * Converts CREATE statements to CREATE OR REPLACE for supported object types.
 * Supports: VIEW, FUNCTION, PROCEDURE
 *
 * @param {string} sql - The SQL content to modify
 * @returns {string} - Modified SQL with CREATE OR REPLACE/ALTER syntax
 */
export function convertToCreateOrReplace(sql: string): string {
  if (!sql || typeof sql !== 'string') {
    return sql;
  }

  // Pattern to match CREATE [object_type] with optional OR REPLACE
  // Handles: CREATE VIEW, CREATE FUNCTION, CREATE PROCEDURE, CREATE SCHEMA
  // Case insensitive and handles whitespace variations

  // For PostgreSQL and most databases: CREATE OR REPLACE works for VIEW, FUNCTION, PROCEDURE
  const createOrReplacePattern = /\bCREATE(\s+OR\s+REPLACE)?\s+(VIEW|FUNCTION|PROCEDURE)\b/gi;

  const modifiedSql = sql.replace(createOrReplacePattern, (match, orReplace, objectType) => {
    // If OR REPLACE already exists, keep it as is
    if (orReplace) {
      return match;
    }

    // Add OR REPLACE
    return `CREATE OR REPLACE ${objectType.toUpperCase()}`;
  });

  return modifiedSql;
}
