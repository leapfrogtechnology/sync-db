import * as Knex from 'knex';
import { reverse } from 'ramda';

import { dbLogger } from '../logger';
import SqlCode from '../domain/SqlCode';
import * as promise from '../util/promise';
import { getDropStatement } from '../util/sql';
import SqlFileInfo from '../domain/SqlFileInfo';

/**
 * Run raw queries in the transaction sequentially.
 *
 * @param {Knex} trx
 * @param {SqlCode[]} files
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export function runSequentially(trx: Knex, files: SqlCode[], connectionId: string): Promise<void> {
  const log = dbLogger(connectionId);
  const promises = files.map(file => {
    log(`Running ${file.name}`);

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
