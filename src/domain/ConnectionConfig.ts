import { Knex } from 'knex';

/**
 * Database connection configuration.
 */
interface ConnectionConfig {
  client: string;
  // Additionally, we also support providing a direct Knex connection instance for programmatic API.
  connection: Knex | Knex.ConnectionConfigProvider | Knex.StaticConnectionConfig | string;
  // This could be anything that Knex supports:
  //  - a connection string
  //  - a Knex.Config.connection config object
  id?: string;
}

export default ConnectionConfig;
