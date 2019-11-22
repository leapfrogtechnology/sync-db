import { connections } from './connections.sync-db.json';

module.exports = {
  client: 'mssql',
  connection: connections[0],
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations'
  }
};
