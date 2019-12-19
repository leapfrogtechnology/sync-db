require("@babel/register");
const { connections } = require("./connections.sync-db.json");
module.exports = {
  client: "postgresql",
  connection: connections[0],
  migrations: {
    directory: "./src/migrations",
    tableName: "knex_migrations"
  }
};

// module.exports = {
//   development: {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
//   },

//   staging: {
//     client: "postgresql",
//     connection: {
//       database: "my_db",
//       user: "username",
//       password: "password"
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: "knex_migrations"
//     }
//   },

//   production: {
//     client: "postgresql",
//     connection: {
//       database: "my_db",
//       user: "username",
//       password: "password"
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: "knex_migrations"
//     }
//   }
// };
