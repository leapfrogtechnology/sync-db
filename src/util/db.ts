import * as Knex from 'knex';
import { getConnectionId } from '../config';
import ConnectionConfig from '../domain/ConnectionConfig';
import { dbLogger } from './logger';
import ConnectionReference from '../domain/ConnectionReference';

/**
 * Returns true if the provided object is a knex connection instance.
 *
 * TODO: Write tests for this supporting both Knex & Knex.Transaction instances.
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isKnexInstance(obj: any): obj is Knex {
  return !!(obj.prototype && obj.prototype.constructor && obj.prototype.constructor.name === 'knex');
}

/**
 * Extracts the connection config params
 * using provided Knex connection instance.
 *
 * @param {Knex} db
 * @returns {Connection}
 */
export function getConfig(db: Knex): ConnectionConfig {
  return {
    ...db.client.config.connection,
    client: db.client.config.client,
    id: getConnectionId(db.client.config.connection)
  };
}

/**
 * Create a new connection instance (knex) using the connection config.
 *
 * @param {ConnectionConfig} config
 * @returns {Knex}
 */
export function createInstance(config: ConnectionConfig): Knex {
  return Knex({ connection: config, client: config.client });
}

/**
 * Run a callback function with in a transaction.
 *
 * @param {ConnectionReference} db
 * @param {(trx: Knex.Transaction) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export function withTransaction<T>(
  db: ConnectionReference,
  callback: (trx: Knex.Transaction) => Promise<T>
): Promise<T> {
  const log = dbLogger(db.id);

  return db.connection.transaction(async trx => {
    log('BEGIN: transaction');

    const result = await callback(trx);

    log('END: transaction');

    return result;
  });
}
