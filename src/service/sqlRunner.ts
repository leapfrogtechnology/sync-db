import { Knex } from 'knex';
import * as path from 'node:path';
import { keys, reverse } from 'ramda';

import { DROP_ONLY_OBJECT_TERMINATOR } from '../constants';
import Mapping from '../domain/Mapping';
import SqlCode from '../domain/SqlCode';
import SqlFileInfo from '../domain/SqlFileInfo';
import DatabaseObjectTypes from '../enum/DatabaseObjectTypes';
import * as fs from '../util/fs';
import { dbLogger } from '../util/logger';
import * as promise from '../util/promise';

/**
 * SQL DROP statements mapping for different object types.
 */
const dropStatementsMap: Mapping<string> = {
  [DatabaseObjectTypes.FUNCTION]: 'DROP FUNCTION IF EXISTS',
  [DatabaseObjectTypes.PROCEDURE]: 'DROP PROCEDURE IF EXISTS',
  [DatabaseObjectTypes.SCHEMA]: 'DROP SCHEMA IF EXISTS',
  [DatabaseObjectTypes.TRIGGER]: 'DROP TRIGGER IF EXISTS',
  [DatabaseObjectTypes.VIEW]: 'DROP VIEW IF EXISTS'
};

/**
 * Reads an sql file and return it's contents. If a file ends with `.drop` on the config file,
 * dropOnly is set as true, and that object would not be synchronized, only dropped.
 *
 * @param {string} sqlBasePath - The base path for the sql files.
 * @param {string} fileName - The name of the sql file.
 * @returns {Promise<SqlCode>} - A promise that resolves with the sql code.
 */
export async function resolveFile(sqlBasePath: string, fileName: string): Promise<SqlCode> {
  let name = fileName;
  let dropOnly = false;

  if (fileName.includes(DROP_ONLY_OBJECT_TERMINATOR)) {
    name = fileName.replace(DROP_ONLY_OBJECT_TERMINATOR, '');
    dropOnly = true;
  }

  const filePath = path.resolve(sqlBasePath, name);
  const sql = await fs.read(filePath);

  return { dropOnly, name, sql };
}

/**
 * Resolves a list of source files.
 *
 * @param {string} sqlBasePath - The base path for the sql files.
 * @param {string[]} files - The list of file names.
 * @returns {Promise<SqlCode[]>} - A promise that resolves with the list of sql codes.
 */
export async function resolveFiles(sqlBasePath: string, files: string[]): Promise<SqlCode[]> {
  const promises = files.map(filename => resolveFile(sqlBasePath, filename));

  return Promise.all(promises);
}

/**
 * Get fully qualified object name.
 *
 * @param {string} type - The database object type.
 * @param {string} name - The object name.
 * @param {string} [schema] - The schema name.
 * @returns {string} - The fully qualified object name.
 */
export function getFQON(type: string, name: string, schema?: string): string {
  if (type === DatabaseObjectTypes.SCHEMA || !schema) {
    return name;
  }

  return `${schema}.${name}`;
}

/**
 * Extract sql file info from the filePath to rollback the synchronization.
 *
 * @param {string} filePath - The file path.
 * @returns {SqlFileInfo} - The sql file info.
 */
export function extractSqlFileInfo(filePath: string): SqlFileInfo {
  // filePath can have multiple sub directories e.g. views/dbo/abc/vw_example.sql
  // The first directory is taken as the object type e.g. views
  // The first sub-directory is taken as the schema name (Optional)
  // The last part of the path is taken as the filename.

  const fileParts = filePath.split('/');
  const fileName = fileParts.pop() || '';
  const [type, schema] = fileParts;

  // Remove .sql and .drop (if exists) from the file name.
  const santizeFileNameRegex = /(.sql)|(.drop)/g;
  const name = fileName.replaceAll(santizeFileNameRegex, '');
  const fqon = getFQON(type, name, schema);

  return { fqon, name, schema, type };
}

/**
 * Get SQL DROP statement for the provided object type.
 *
 * @param {string} type - Database object type e.g. view, function, procedure, trigger.
 * @param {string} fqon - Fully qualified object name.
 * @returns {string} - The SQL DROP statement.
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
 * @param {Knex} trx - The knex transaction.
 * @param {SqlCode[]} files - The list of sql files.
 * @param {string} connectionId - The connection id.
 * @returns {Promise<any[]>} - A promise that resolves with the list of results.
 */
export function runSequentially(trx: Knex, files: SqlCode[], connectionId: string): Promise<any[]> {
  const log = dbLogger(connectionId);
  const promises = files.map(file => {
    if (file.dropOnly) {
      log(`Skipping ${file.name} from synchronization.`);

      return () => Promise.resolve();
    }

    log(`Running ${file.name}`);

    return () => trx.raw(file.sql);
  });

  return promise.runSequentially(promises);
}

/**
 * Rollback SQL files sequentially in reverse order of the file list.
 *
 * @param {Knex} trx - The knex transaction.
 * @param {SqlFileInfo[]} files - The list of sql files.
 * @param {string} connectionId - The connection id.
 * @returns {Promise<void>} - A promise that resolves when the rollback is done.
 */
export async function rollbackSequentially(trx: Knex, files: SqlFileInfo[], connectionId: string): Promise<void> {
  const log = dbLogger(connectionId);
  const sqlFiles = files.map(info => ({
    dropStatement: getDropStatement(info.type, info.fqon),
    fqon: info.fqon
  }));

  for (const sql of reverse(sqlFiles)) {
    log(`Rolling back: ${sql.fqon}`);

    await trx.raw(sql.dropStatement);

    log('Executed: ', sql.dropStatement);
  }
}
