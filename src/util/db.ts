import * as Knex from 'knex';
import { getConnectionId } from '../config';
import ConnectionConfig from '../domain/ConnectionConfig';

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
