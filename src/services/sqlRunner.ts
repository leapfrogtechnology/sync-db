import * as Knex from 'knex';
import * as path from 'path';
import { reverse, keys } from 'ramda';

import * as fs from '../util/fs';
import { dbLogger } from '../logger';
import Mapping from '../domain/Mapping';
import SqlCode from '../domain/SqlCode';
import * as promise from '../util/promise';
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
 * Extract sql file info from the filePath
 *
 * @param {string} filePath
 * @returns {SqlFileInfo}
 */
export function extractSqlFileInfo(filePath: string): SqlFileInfo {
  // filePath can have multiple sub directories e.g. views/dbo/abc/vw_example.sql
  // The first directory is taken as the object type e.g. views
  // The first sub-directory is taken as the schema name (Optional)
  // The last part of the path is taken as the filename.

  const fileParts = filePath.split('/');
  const fileName = fileParts.pop() || '';
  const [type, schema] = fileParts;
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

/**
 * Run raw queries in the transaction sequentially.
 *
 * @param {Knex} trx
 * @param {SqlCode[]} files
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export function runSequentially(trx: Knex, files: SqlCode[], connectionId: string): Promise<void> {
  const logDb = dbLogger(connectionId);
  const promises = files.map(file => {
    logDb(`Running ${file.name}`);

    return trx.raw(file.sql);
  });

  return promise.runSequentially(promises);
}

/**
 * Rollback SQL files sequentially in reverse order of the file list.
 *
 * @param {Knex} trx
 * @param {SqlFileInfo[]} files
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export async function rollbackSequentially(trx: Knex, files: SqlFileInfo[], connectionId: string): Promise<void> {
  const logDb = dbLogger(connectionId);
  const sqlFiles = files.map(info => ({
    fqon: info.fqon,
    dropStatement: getDropStatement(info.type, info.fqon)
  }));

  for (const sql of reverse(sqlFiles)) {
    logDb(`Rolling back: ${sql.fqon}`);

    await trx.raw(sql.dropStatement);

    logDb('Executed: ', sql.dropStatement);
  }
}
