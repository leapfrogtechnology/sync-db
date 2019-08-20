import * as Knex from 'knex';

import ConnectionConfig from '../domain/ConnectionConfig';

/**
 * Creates a knex database connection instance from
 * the provided database configuration.
 *
 * @param {Knex.Config} connectionConfig
 * @returns {Knex}
 */
export function createInstance(connectionConfig: ConnectionConfig): Knex {
  return Knex({
    client: connectionConfig.client,
    connection: connectionConfig
  });
}
