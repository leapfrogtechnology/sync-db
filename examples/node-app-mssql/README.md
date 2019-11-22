# Node MSSQL Example (JavaScript)

Sample project for Microsoft SQL Server.

## Setup

Install dependencies.

```bash
$ yarn
```

Configure database connection(s) in the `connections.sync-db.json`.

```bash
$ cp connections.sync-db.json.example connections.sync-db.json
```

## Migrations

Create a configuration file `knexfile.ts` in the root directory.

```

import { connections } from './connections.sync-db';

module.exports = {
  client: "mssql",
  connection: connections[0],
  migrations: {
    directory: "./src/sql/migrations",
    tableName: "knex_migrations"
  }
};
```

Let's create the scripts to create, run and rollback migrations in `package.json` file

```
"make": "knex --knexfile=knexfile.ts migrate:make -x ts",
"migrate": "knex --knexfile=knexfile.ts migrate:latest",
"rollback": "knex --knexfile=knexfile.ts migrate:rollback"
```

## Creating/Dropping Tables

Let's create a migration file for user using the script. In the root of our project run the following commands

```
$ yarn make create_users_table
```

The above command will generate a migration script in `src/sql/migrations/`

Now we'll create users table using knex built-in methods

Example: `20191122122354_create_users_table.ts`

```
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
}
```

Now we can run the below command performing a migration and updating our database:

```
$ yarn migrate
```

for rollback use

```
$ yarn rollback
```

## Running

Run `sync-db` to synchronize all database objects (views, functions, procedures, schemas, etc) in the configured database(s).

```
$ yarn sync-db
```

Run the sample node app.

```
$ yarn start
```

**Output**

```
List of table names in the database:
[ 'table1',
  'table2',
  'table3' ]

List of user names in the database:
[ 'user1',
  'user2',
  'user3' ]

Calculations:
 { 'Sum of 6 and 7': 13,
  'Product of 6 and 7': 42,
  'Square of 6': 36 }

Current date time: 2019-08-02T09:29:24.730Z
```

## Docker

Set `DB_PASSWORD` (password for `SA` user) in environment. e.g

```bash
$ export DB_PASSWORD=Password@123
```

Configure database connection(s) in the `connections.sync-db.json`. Use same `password` as `DB_PASSWORD`
Note: `host` has to be the service name of docker container for `mssql`.

```bash
$ cp connections.sync-db.json.docker connections.sync-db.json
```

Then run (in order).

```bash
$ docker-compose up mssql
$ docker-compose up app
```
