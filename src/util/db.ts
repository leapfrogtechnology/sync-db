import * as Knex from 'knex';
import ConnectionConfig from '../domain/ConnectionConfig';

/**
 * Creates a knex database connection instance from
 * the provided database configuration.
 *
 * @param {Knex.Config} dbConfig
 * @returns {Knex}
 */
export function createInstance(dbConfig: ConnectionConfig): Knex {
  return Knex({
    client: dbConfig.client,
    connection: dbConfig
  });
}
