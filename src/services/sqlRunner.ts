import * as Knex from 'knex';
import { reverse } from 'ramda';

import { dbLogger } from '../logger';
import SqlCode from '../domain/SqlCode';
import * as promise from '../util/promise';
import { getDropStatement } from '../util/sql';
import SqlObjectSourceCode from '../domain/SqlObjectSourceCode';

/**
 * Run raw queries in the transaction sequentially.
 *
 * @param {Knex} trx
 * @param {((SqlObjectSourceCode | SqlCode)[])} files
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export function runSequentially(
  trx: Knex,
  files: (SqlObjectSourceCode | SqlCode)[],
  connectionId: string
): Promise<void> {
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
 * @param {SqlObjectSourceCode[]} files
 * @param {string} connectionId
 * @returns {Promise<void>}
 */
export async function rollbackSequentially(
  trx: Knex,
  files: SqlObjectSourceCode[],
  connectionId: string
): Promise<void> {
  const log = dbLogger(connectionId);
  const dropList = files.map(({ info }) => ({
    fqon: info.fqon,
    dropStatement: getDropStatement(info.type, info.fqon)
  }));

  for (const sql of reverse(dropList)) {
    log(`Rollback: ${sql.fqon}`);

    await trx.raw(sql.dropStatement);

    log('Executed: ', sql.dropStatement);
  }
}
