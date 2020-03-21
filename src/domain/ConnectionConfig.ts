import * as Knex from 'knex';

/**
 * Database connection configuration.
 */
type KnexConnections = Knex.ConnectionConfig &
  Knex.MariaSqlConnectionConfig &
  Knex.MySqlConnectionConfig &
  Knex.MsSqlConnectionConfig &
  Knex.SocketConnectionConfig &
  Knex.Sqlite3ConnectionConfig;

type ConnectionConfig = KnexConnections & {
  id?: string;
  client: string;
};

export default ConnectionConfig;
