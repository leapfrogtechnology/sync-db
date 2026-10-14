import { Knex } from 'knex';
import * as path from 'path';
import { reverse, keys } from 'ramda';

import * as fs from '../util/fs';
import Mapping from '../domain/Mapping';
import SqlCode from '../domain/SqlCode';
import { dbLogger } from '../util/logger';
import * as promise from '../util/promise';
import SqlFileInfo from '../domain/SqlFileInfo';
import { DROP_BATCH_SIZE, DROP_ONLY_OBJECT_TERMINATOR, MAX_CONCURRENT_FILE_READS } from '../constants';
import DatabaseObjectTypes from '../enum/DatabaseObjectTypes';

/**
 * SQL DROP statements mapping for different object types.
 */
const dropStatementsMap: Mapping<string> = {
  [DatabaseObjectTypes.SCHEMA]: 'DROP SCHEMA IF EXISTS',
  [DatabaseObjectTypes.VIEW]: 'DROP VIEW IF EXISTS',
  [DatabaseObjectTypes.FUNCTION]: 'DROP FUNCTION IF EXISTS',
  [DatabaseObjectTypes.PROCEDURE]: 'DROP PROCEDURE IF EXISTS',
  [DatabaseObjectTypes.TRIGGER]: 'DROP TRIGGER IF EXISTS'
};

/**
 * Reads an sql file and return it's contents. If a file ends with `.drop` on the config file,
 * dropOnly is set as true, and that object would not be synchronized, only dropped.
 *
 * @param {string} sqlBasePath
 * @param {string} fileName
 * @returns {Promise<SqlCode>}
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

  return { sql, name, dropOnly };
}

/**
 * Reads an SQL source file given the base path and the file name.
 */
export type SqlSourceReader = (sqlBasePath: string, fileName: string) => Promise<SqlCode>;

/**
 * Create a reader that reads every file from the disk only once and shares the result
 * with all the callers. Useful when the same files are synchronized to many databases.
 *
 * @returns {SqlSourceReader}
 */
export function createSourceCache(): SqlSourceReader {
  const cache = new Map<string, Promise<SqlCode>>();

  return (sqlBasePath, fileName) => {
    const key = `${sqlBasePath}\0${fileName}`;
    let source = cache.get(key);

    if (!source) {
      source = resolveFile(sqlBasePath, fileName);
      cache.set(key, source);
    }

    return source;
  };
}

/**
 * Resolves a list of source files.
 * At most MAX_CONCURRENT_FILE_READS files are read at a time to avoid running out of file descriptors.
 *
 * @param {string} sqlBasePath
 * @param {string[]} files
 * @param {SqlSourceReader} [read]
 * @returns {Promise<SqlCode[]>}
 */
export async function resolveFiles(
  sqlBasePath: string,
  files: string[],
  read: SqlSourceReader = resolveFile
): Promise<SqlCode[]> {
  const promises = files.map(filename => () => read(sqlBasePath, filename));

  return promise.runWithConcurrency(promises, MAX_CONCURRENT_FILE_READS);
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
 * Extract sql file info from the filePath to rollback the synchronization.
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

  // Remove .sql and .drop (if exists) from the file name.
  const santizeFileNameRegex = /(.sql)|(.drop)/g;
  const name = fileName.replace(santizeFileNameRegex, '');
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
 * @returns {Promise<any[]>}
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
 * Join the statements into batches of at most `size` statements, preserving their order.
 *
 * @param {string[]} statements
 * @param {number} size
 * @returns {string[]}
 */
export function toBatches(statements: string[], size: number): string[] {
  const batches: string[] = [];

  for (let i = 0; i < statements.length; i += size) {
    batches.push(statements.slice(i, i + size).join(';\n'));
  }

  return batches;
}

/**
 * Rollback SQL files in reverse order of the file list.
 * The DROP statements are sent in batches to save a database round trip per object.
 *
 * @param {Knex} trx
 * @param {SqlFileInfo[]} files
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export async function rollbackSequentially(trx: Knex, files: SqlFileInfo[], connectionId: string): Promise<void> {
  const log = dbLogger(connectionId);
  const dropStatements = reverse(files).map(info => getDropStatement(info.type, info.fqon));

  for (const batch of toBatches(dropStatements, DROP_BATCH_SIZE)) {
    log(`Rolling back ${batch.split(';\n').length} object(s).`);

    await trx.raw(batch);

    log('Executed: ', batch);
  }
}
