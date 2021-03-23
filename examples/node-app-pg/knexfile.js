const { connections } = require('./connections.sync-db.json');

module.exports = {
  client: 'pg',
  connection: connections[0],
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations'
  }
};
