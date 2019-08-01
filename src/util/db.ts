import * as Knex from 'knex';

import Connection from '../domain/Connection';

/**
 * Creates a knex database connection instance from
 * the provided database configuration.
 *
 * @param {Knex.Config} connectionConfig
 * @returns {Knex}
 */
export function createInstance(connectionConfig: Connection): Knex {
  return Knex({
    client: connectionConfig.client,
    connection: connectionConfig
  });
}
