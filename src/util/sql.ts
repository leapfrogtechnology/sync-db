import * as path from 'path';
import { keys } from 'ramda';

import * as fs from './fs';
import Mapping from '../domain/Mapping';
import SqlCode from '../domain/SqlCode';
import { SUPPORTED_TYPES } from '../constants';
import SqlFileInfo from '../domain/SqlFileInfo';
import DatabaseObjectTypes from '../enums/DatabaseObjectTypes';

/**
 * SQL DROP statements mapping for different object types.
 */
const dropStatementsMap: Mapping<string> = {
  [DatabaseObjectTypes.SCHEMA]: 'DROP SCHEMA IF EXISTS',
  [DatabaseObjectTypes.VIEW]: 'DROP VIEW IF EXISTS',
  [DatabaseObjectTypes.FUNCTION]: 'DROP FUNCTION IF EXISTS',
  [DatabaseObjectTypes.PROCEDURE]: 'DROP PROCEDURE IF EXISTS'
};

/**
 * Reads an sql file and return it's contents.
 *
 * @param {string} basePath
 * @param {string} fileName
 * @returns {Promise<SqlCode>}
 */
export async function resolveFile(basePath: string, fileName: string): Promise<SqlCode> {
  const filePath = path.resolve(basePath, fileName);
  const sql = await fs.read(filePath);

  return { sql, name: fileName };
}

/**
 * Resolves a list of source files.
 *
 * @param {string} basePath
 * @param {string[]} files
 * @returns {Promise<SqlCode[]>}
 */
export async function resolveFiles(basePath: string, files: string[]): Promise<SqlCode[]> {
  const promises = files.map(filename => resolveFile(basePath, filename));

  return Promise.all(promises);
}

/**
 * Get fully qualified object name.
 *
 * @param {string} type
 * @param {string} name
 * @param {string} [schema]
 * @returns {string}
 */
export function getFQON(type: string, name: string, schema?: string): string {
  if (type === DatabaseObjectTypes.SCHEMA || !schema) {
    return name;
  }

  return `${schema}.${name}`;
}

/**
 * Extract sql file info from the filePath (relative to basePath).
 *
 * @param {string} filePath
 * @returns {SqlFileInfo}
 */
export function extractSqlFileInfo(filePath: string): SqlFileInfo {
  // Note: It supports only relative path for now;
  // in order to support absolute paths, the current logic needs
  // to be changed which implies a breaking change.
  if (path.isAbsolute(filePath)) {
    throw new Error(`Path must be relative to the 'basePath'. Invalid path provided "${filePath}".`);
  }

  // The filePath can have multiple sub directories e.g. view/dbo/vw_example.sql.
  // - The first directory in the path is taken as the object type e.g. view
  // - The first sub-directory is taken as the schema name (Optional)
  // - The last part of the path is taken as the filename.
  const fileParts = filePath.split('/');
  const fileName = fileParts.pop() || '';
  const [type, schema] = fileParts;

  // Type-checking - throw an error if not a supported type.
  if (!SUPPORTED_TYPES.includes(type)) {
    throw new Error(
      `Unsupported object type "${type}". The only supported types are: ` + SUPPORTED_TYPES.join(', ') + '.'
    );
  }

  const name = fileName.replace('.sql', '');
  const fqon = getFQON(type, name, schema);

  return { name, fqon, type, schema };
}

/**
 * Get SQL DROP statement for the provided object type.
 *
 * @param {string} type   Database object type
 * @param {string} fqon   Fully qualified object name.
 * @returns {string}
 */
export function getDropStatement(type: string, fqon: string): string {
  const dropStatement = dropStatementsMap[type];

  if (!dropStatement) {
    const message = `Naming convention must be one of: ${keys(dropStatementsMap)}.`;

    throw new Error(`No database object type: ${type}. ${message}`);
  }

  return `${dropStatement} ${fqon}`;
}
