import * as Knex from 'knex';

import ConnectionConfig from '../domain/ConnectionConfig';
import ConnectionInstance from '../domain/ConnectionInstance';

/**
 * Creates a connection instance from
 * the provided database configuration.
 *
 * @param {ConnectionConfig} connectionConfig
 * @returns {ConnectionInstance}
 */
export function createInstance(connectionConfig: ConnectionConfig): ConnectionInstance {
  return Knex({
    client: connectionConfig.client,
    connection: connectionConfig
  });
}

/**
 * Reteives connection configurations from a connection instance.
 *
 * @param {ConnectionInstance} db
 * @returns {ConnectionConfig}
 */
export function getConfig(db: ConnectionInstance): ConnectionConfig {
  return {
    ...db.client.config.connection,
    id: db.client.config.connection.database,
    client: db.client.config.client
  };
}

/**
 * Returns true if the provided object is a connection instance.
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isConnectionInstance(obj: any): obj is ConnectionInstance {
  return !!(obj.prototype && obj.prototype.constructor && obj.prototype.constructor.name === 'knex');
}
