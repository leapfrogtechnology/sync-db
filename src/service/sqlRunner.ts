import * as Knex from 'knex';
import * as path from 'path';
import { reverse, keys } from 'ramda';

import * as fs from '../util/fs';
import Mapping from '../domain/Mapping';
import SqlCode from '../domain/SqlCode';
import { dbLogger } from '../util/logger';
import * as promise from '../util/promise';
import SqlFileInfo from '../domain/SqlFileInfo';
import { DROP_ONLY_OBJECT_TERMINATOR } from '../constants';
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
 * Reads an sql file and return it's contents. If a file ends with `.dropped` on the config file,
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
 * Resolves a list of source files.
 *
 * @param {string} sqlBasePath
 * @param {string[]} files
 * @returns {Promise<SqlCode[]>}
 */
export async function resolveFiles(sqlBasePath: string, files: string[]): Promise<SqlCode[]> {
  const promises = files.map(filename => resolveFile(sqlBasePath, filename));

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

  // Remove .sql and .dropped (if exists) from the file name.
  const santizeFileNameRegex = /(.sql)|(.dropped)/g;
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
 * Rollback SQL files sequentially in reverse order of the file list.
 *
 * @param {Knex} trx
 * @param {SqlFileInfo[]} files
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export async function rollbackSequentially(trx: Knex, files: SqlFileInfo[], connectionId: string): Promise<void> {
  const log = dbLogger(connectionId);
  const sqlFiles = files.map(info => ({
    fqon: info.fqon,
    dropStatement: getDropStatement(info.type, info.fqon)
  }));

  for (const sql of reverse(sqlFiles)) {
    log(`Rolling back: ${sql.fqon}`);

    await trx.raw(sql.dropStatement);

    log('Executed: ', sql.dropStatement);
  }
}
