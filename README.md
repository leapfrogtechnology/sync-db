# sync-db

Command line utility to synchronize and version control relational database objects across databases.

[![Version](https://img.shields.io/npm/v/@leapfrogtechnology/sync-db.svg?style=flat-square)](https://npmjs.org/package/@leapfrogtechnology/sync-db)
[![Travis](https://img.shields.io/travis/com/leapfrogtechnology/sync-db.svg?style=flat-square)](https://travis-ci.com/leapfrogtechnology/sync-db)
[![Language grade: TypeScript](https://img.shields.io/lgtm/grade/javascript/g/laudio/sync-db.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/laudio/sync-db/context:javascript)
[![LICENSE](https://img.shields.io/github/license/leapfrogtechnology/sync-db.svg?style=flat-square)](https://github.com/leapfrogtechnology/sync-db/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/leapfrogtechnology/sync-db#contributing)

## Setup

### Installation

You can install it using `npm` or `yarn`.

```bash
$ npm install @leapfrogtechnology/sync-db
# OR
$ yarn add @leapfrogtechnology/sync-db
```

You can install it globally too.

```bash
$ npm install -g @leapfrogtechnology/sync-db
# OR
$ yarn global add @leapfrogtechnology/sync-db
```

Verify the installation.

```bash
$ sync-db --version
```

Additionally, you'll need to install the database driver specific to your project.

For instance - if you're using MSSQL, you can do:

```
$ yarn add mssql
```

This utility uses [Knex](http://knexjs.org/) under the hood so these are the [supported drivers](http://knexjs.org/#Installation-node).

### Configuring Connections

You'll need a `connections-sync-db.json` file in your project folder as shown below with all the databases connections.

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
    },
    {
      "id": "db2",
      "host": "localhost",
      "port": 1433,
      "user": "db2user",
      "database": "db2",
      "password": "password",
      "client": "mssql"
    }
  ]
}
```

### Directory Structure

1. The SQL codebase containing all your database objects need to follow the following directory structure.

```
 └─ sql
    ├─ schema
    │  ├─ schema1.sql
    │  ├─ schema2.sql
    │  ├─ schema3.sql
    │  └─ ...
    │
    ├─ function
    │  ├─ schema1
    │  │  ├─ function1.sql
    │  │  ├─ function2.sql
    │  │  └─ ...
    │  ├─ schema2
    │  │  ├─ function3.sql
    │  │  ├─ function4.sql
    │  │  └─ ...
    │  ├─ function5.sql
    │  └─ ...
    │
    ├─ procedure
    │  ├─ schema1
    │  │  ├─ procedure1.sql
    │  │  ├─ procedure2.sql
    │  │  └─ ...
    │  ├─ schema2
    │  │  ├─ procedure3.sql
    │  │  ├─ procedure4.sql
    │  │  └─ ...
    │  ├─ procedure5.sql
    │  └─ ...
    │
    └─...

```

**Note: When procedures and functions aren't placed inside a schema folder, they are associated with the default schema.**

2. Create `sync-db.yml` file in your project folder.

```yml
# Base path for the SQL source files.
# If omitted, "src/sql" will be the default base path.
basePath: /path/to/sql

sql:
  - schema/<schema_name>.sql
  - function/<schema_name>/<function_name>.sql
  - procedure/<schema_name>/<procedure_name>.sql
```

## Usage

You can use sync-db as a CLI tool as well as within your scripts.

### CLI

When installed globally, you can just invoke the CLI directly.

```bash
$ sync-db
```

For local installation you can trigger it with [`npx`](https://www.npmjs.com/package/npx).

```
$ npx sync-db
```

#### Using npm script

You can also add a script into your project's `package.json` file like this:

```json
{
  "scripts": {
    "sync-db": "sync-db"
  }
}
```

This allows you to trigger `sync-db` like this:

```bash
$ yarn sync-db
```

Or,

```bash
$ npm run sync-db
```

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

#### Caveat

Setup and Teardown steps aren't always run within a single transaction. **You need to specifically pass a trx object to make sure this happens.**

```ts
await db.transaction(async trx => {
  // Rollback and create all db objects using config.
  await synchronize(config, trx as any, { force: false });

  // Perform other db operations
  // ...
});
```

## Sample Projects

1. [Node MSSQL Sample (JavaScript)](examples/node-app-mssql)

## Changelog

Check the [CHANGELOG](CHANGELOG.md) for release history.

## Contributing

Feel free to send pull requests.

## License

Licensed under [The MIT License](LICENSE).
