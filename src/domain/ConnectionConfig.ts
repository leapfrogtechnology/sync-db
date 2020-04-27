import * as Knex from 'knex';

/**
 * Database connection configuration.
 */
interface ConnectionConfig {
  id?: string;
  client: string;
  // This could be anything that Knex supports:
  //  - a connection string
  //  - a Knex.Config.connection config object
  // Additionally, we also support providing a direct Knex connection instance for programmatic API.
  connection: string | Knex | Knex.StaticConnectionConfig | Knex.ConnectionConfigProvider;
}

export default ConnectionConfig;
