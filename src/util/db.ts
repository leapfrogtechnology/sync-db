import * as Knex from 'knex';

import Connection from '../domain/Connection';

/**
 * Creates a knex database connection instance from
 * the provided database configuration.
 *
 * @param {Knex.Config} dbConfig
 * @returns {Knex}
 */
export function createInstance(dbConfig: Connection): Knex {
  return Knex({
    client: dbConfig.client,
    connection: dbConfig
  });
}
