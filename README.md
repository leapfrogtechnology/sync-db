# sync-db

Command line utility to synchronize and version control relational database objects across databases.

[![Version](https://img.shields.io/npm/v/@leapfrogtechnology/sync-db.svg?style=flat-square)](https://npmjs.org/package/@leapfrogtechnology/sync-db)
[![Travis](https://img.shields.io/travis/com/leapfrogtechnology/sync-db.svg?style=flat-square)](https://travis-ci.com/leapfrogtechnology/sync-db)
[![Language Grade: TypeScript](https://img.shields.io/lgtm/grade/javascript/g/laudio/sync-db.svg?style=flat-square&logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/laudio/sync-db/context:javascript)
[![Codecov](https://img.shields.io/codecov/c/github/leapfrogtechnology/sync-db?style=flat-square)](https://codecov.io/gh/leapfrogtechnology/sync-db)
[![LICENSE](https://img.shields.io/github/license/leapfrogtechnology/sync-db.svg?style=flat-square)](https://github.com/leapfrogtechnology/sync-db/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/leapfrogtechnology/sync-db#contributing)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleapfrogtechnology%2Fsync-db.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleapfrogtechnology%2Fsync-db?ref=badge_shield)

## Installation

**Using npm:**

```bash
$ npm install @leapfrogtechnology/sync-db
```

You can install it **globally** as well.

```bash
$ npm install -g @leapfrogtechnology/sync-db
```

### Drivers Installation

You'll need to install the database driver specific to your project separately.

For instance - if your project uses MSSQL, you will need to do:

```
$ yarn add mssql
```

This utility uses [Knex](http://knexjs.org/) under the hood so these are the [supported drivers](http://knexjs.org/#Installation-node).

## Usage

You can use `sync-db` both as a CLI utility and programmatically.

### CLI

When installed globally, you can invoke the CLI directly.

The CLI exposes a single command `sync-db` that runs synchronize operation based on your [configuration](#configuration).

**CLI Options**

Below shown are the available CLI options , which is also the output printed by `sync-db --help`.

```bash
Synchronize database

USAGE
  $ sync-db

OPTIONS
  -f, --force                 Force synchronization
  -h, --help                  Print help information
  -v, --version               Print version
  -c, --generate-connections  Generate connections.sync-db.json file
```

Refer to the [examples](#examples) section below for full example with CLI usage.

### Programmatic Usage

You may use programmatic API as shown below in case you need better flexibility based on your needs.

```ts
import { synchronize, loadConfig, resolveConnections } from '@leapfrogtechnology/sync-db';

(async () => {
  const config = await loadConfig(); // Load sync-db.yml
  const connections = await resolveConnections(); // Load connections.sync-db.json

  // Invoke the command.
  await synchronize(config, connections);
})();
```

You can also pass your own database connection (eg: Knex connection) instead of resolving `connections.sync-db.json` file.

```ts
import * as Knex from 'knex';
import { synchronize, loadConfig } from '@leapfrogtechnology/sync-db';

(async () => {
  const config = await loadConfig(); // Load sync-db.yml
  const connection = Knex({
    // Your Knex connection instance.
    client: 'mssql',
    connection: {
      host: 'host',
      user: 'userName',
      password: 'password',
      database: 'dbName'
    }
  });
  const options = { force: false };

  // Invoke the command.
  await synchronize(config, connection, options);
})();
```

## Configuration

1. [Sync Configuration](#1-sync-configuration)
2. [Database Connections](#2-database-connections)

### 1. Sync Configuration

sync-db expects the configuration file `sync-db.yml` to be present in your working directory. This holds all your configurations.

**sync-db.yml**

```yml
# Base path for the SQL source files.
basePath: /path/to/sql

sql:
  - schema/<schema_name>.sql
  - function/<schema_name>/<function_name>.sql
  - procedure/<schema_name>/<procedure_name>.sql
```

#### Configuration Options

- **`basePath`** `(string)` - Base directory to hold all your SQL source files (default: "src/sql").
- **`sql`** `(array)` - A series of SQL file paths that are to be run in ordered sequence (top to bottom), based on dependency. It should be noted that the source files needs to follow this convention of [directory hierarchy](docs/sql.md).
  File paths listed here are relative to `basePath` value.

### 2. Database Connections

Database connections are configured in `connections.sync-db.json` file in your project root directory as shown below.

Since it contains all your database credentials, it is recommended that you **DO NOT COMMIT** it to VCS.

**connections.sync-db.json**

```json
{
  "connections": [
    {
      "id": "db1",
      "host": "localhost",
      "port": 1433,
      "user": "db1user",
      "database": "db1",
      "password": "password",
      "client": "mssql"
    }
  ]
}
```

Note: The `connections` key expects an array, so you can also provide multiple databases and `sync-db` ensures your configured db objects are synced across all these databases.

#### Caveat

Setup and Teardown steps aren't always run within a single transaction. **You need to pass the transaction instance object explicitly to make sure this happens.**

```js
await db.transaction(async trx => {
  // Rollback and create all db objects using config.
  await synchronize(config, trx);
});
```

## Examples

1. [Node MSSQL Sample](examples/node-app-mssql)
2. [Node MSSQL Programmatic Usage Sample](examples/node-mssql-programmatic-use)
3. [Node PostgreSQL Sample](examples/node-app-pg)

## Changelog

Check the [CHANGELOG](CHANGELOG.md) for release history.

## Contributing

Feel free to send pull requests.

## License

Licensed under [The MIT License](LICENSE).


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fleapfrogtechnology%2Fsync-db.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fleapfrogtechnology%2Fsync-db?ref=badge_large)