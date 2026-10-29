# sync-db

Command line utility to synchronize and version control relational database objects across databases.

## Installation

**Using npm:**

```bash
$ npm install @leapfrogtechnology/sync-db
```

### Drivers Installation

You'll need to install the database driver specific to your project separately.

For instance - if your project uses MSSQL, you will need to do:

```
$ yarn add tedious
```

This utility uses [Knex](http://knexjs.org/) under the hood so these are the [supported drivers](http://knexjs.org/#Installation-node).

## Usage

You can use `sync-db` both as a CLI utility and programmatically.

<!-- usage -->

```sh-session
$ npm install -g @leapfrogtechnology/sync-db
$ sync-db COMMAND
running command...
$ sync-db (--version|-v)
@leapfrogtechnology/sync-db/2.3.1 darwin-arm64 node-v22.23.3
$ sync-db --help [COMMAND]
USAGE
  $ sync-db COMMAND
...
```

<!-- usagestop -->

## Commands

When installed globally, you can invoke the CLI directly.

The CLI exposes a single command `sync-db` that runs synchronize operation based on your [configuration](#configuration).

<!-- commands -->

- [`sync-db help [COMMAND]`](#sync-db-help-command)
- [`sync-db make NAME`](#sync-db-make-name)
- [`sync-db make-publish`](#sync-db-make-publish)
- [`sync-db migrate-latest`](#sync-db-migrate-latest)
- [`sync-db migrate-list`](#sync-db-migrate-list)
- [`sync-db migrate-rollback`](#sync-db-migrate-rollback)
- [`sync-db prune`](#sync-db-prune)
- [`sync-db synchronize`](#sync-db-synchronize)
- [`sync-db version`](#sync-db-version)

## `sync-db help [COMMAND]`

Display help for sync-db.

```
USAGE
  $ sync-db help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for sync-db.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/7.0.6/src/commands/help.ts)_

## `sync-db make NAME`

Make migration files from the template.

```
USAGE
  $ sync-db make NAME [--object-name <value>] [--create] [-c <value>] [-t TYPE]

ARGUMENTS
  NAME  Object or filename to generate.

FLAGS
  -c, --config=<value>       Custom configuration file.
  -t, --type=TYPE            [default: migration] Type of file to generate.
      --create               Generate create table stub.
      --object-name=<value>  Name of table/view/routine to migrate.

DESCRIPTION
  Make migration files from the template.
```

_See code: [src/commands/make.ts](https://github.com/leapfrogtechnology/sync-db/blob/v2.3.1/src/commands/make.ts)_

## `sync-db make-publish`

Publish migration templates files.

```
USAGE
  $ sync-db make-publish [-c <value>]

FLAGS
  -c, --config=<value>  Custom configuration file.

DESCRIPTION
  Publish migration templates files.
```

_See code: [src/commands/make-publish.ts](https://github.com/leapfrogtechnology/sync-db/blob/v2.3.1/src/commands/make-publish.ts)_

## `sync-db migrate-latest`

Run the migrations up to the latest changes.

```
USAGE
  $ sync-db migrate-latest [--dry-run] [--only CONNECTION_ID(s)] [--connection-resolver PATH] [-c <value>]

FLAGS
  -c, --config=<value>            Custom configuration file.
      --connection-resolver=PATH  Path to the connection resolver.
      --dry-run                   Dry run migration.
      --only=CONNECTION_ID(s)     Filter provided connection(s). Comma separated ids eg: id1,id2

DESCRIPTION
  Run the migrations up to the latest changes.
```

_See code: [src/commands/migrate-latest.ts](https://github.com/leapfrogtechnology/sync-db/blob/v2.3.1/src/commands/migrate-latest.ts)_

## `sync-db migrate-list`

List all the migrations.

```
USAGE
  $ sync-db migrate-list [--only CONNECTION_ID(s)] [--connection-resolver PATH] [-c <value>]

FLAGS
  -c, --config=<value>            Custom configuration file.
      --connection-resolver=PATH  Path to the connection resolver.
      --only=CONNECTION_ID(s)     Filter provided connection(s). Comma separated ids eg: id1,id2

DESCRIPTION
  List all the migrations.
```

_See code: [src/commands/migrate-list.ts](https://github.com/leapfrogtechnology/sync-db/blob/v2.3.1/src/commands/migrate-list.ts)_

## `sync-db migrate-rollback`

Rollback migrations up to the last run batch.

```
USAGE
  $ sync-db migrate-rollback [--dry-run] [--only CONNECTION_ID(s)] [--connection-resolver PATH] [-c <value>]

FLAGS
  -c, --config=<value>            Custom configuration file.
      --connection-resolver=PATH  Path to the connection resolver.
      --dry-run                   Dry run rollback.
      --only=CONNECTION_ID(s)     Filter provided connection(s). Comma separated ids eg: id1,id2

DESCRIPTION
  Rollback migrations up to the last run batch.
```

_See code: [src/commands/migrate-rollback.ts](https://github.com/leapfrogtechnology/sync-db/blob/v2.3.1/src/commands/migrate-rollback.ts)_

## `sync-db prune`

Drop all the synchronized db objects except the ones created via migrations.

```
USAGE
  $ sync-db prune [--dry-run] [--only CONNECTION_ID(s)] [--connection-resolver PATH] [-c <value>]

FLAGS
  -c, --config=<value>            Custom configuration file.
      --connection-resolver=PATH  Path to the connection resolver.
      --dry-run                   Dry run prune.
      --only=CONNECTION_ID(s)     Filter provided connection(s). Comma separated ids eg: id1,id2

DESCRIPTION
  Drop all the synchronized db objects except the ones created via migrations.
```

_See code: [src/commands/prune.ts](https://github.com/leapfrogtechnology/sync-db/blob/v2.3.1/src/commands/prune.ts)_

## `sync-db synchronize`

Synchronize all the configured database connections.

```
USAGE
  $ sync-db synchronize [-f] [--dry-run] [--skip-migration] [--sync-files FILE_PATH(s)] [--only CONNECTION_ID(s)]
    [--connection-resolver PATH] [-c <value>]

FLAGS
  -c, --config=<value>            Custom configuration file.
  -f, --force                     Force synchronization.
      --connection-resolver=PATH  Path to the connection resolver.
      --dry-run                   Dry run synchronization.
      --only=CONNECTION_ID(s)     Filter provided connection(s). Comma separated ids eg: id1,id2
      --skip-migration            Skip running migrations.
      --sync-files=FILE_PATH(s)   Comma separated relative file paths to sync. When provided, skips teardown and only
                                  syncs specified files.

DESCRIPTION
  Synchronize all the configured database connections.
```

_See code: [src/commands/synchronize.ts](https://github.com/leapfrogtechnology/sync-db/blob/v2.3.1/src/commands/synchronize.ts)_

## `sync-db version`

```
USAGE
  $ sync-db version [--json] [--verbose]

FLAGS
  --verbose  Show additional information about the CLI.

GLOBAL FLAGS
  --json  Format output as json.

FLAG DESCRIPTIONS
  --verbose  Show additional information about the CLI.

    Additionally shows the architecture, node version, operating system, and versions of plugins that the CLI is using.
```

_See code: [@oclif/plugin-version](https://github.com/oclif/plugin-version/blob/3.0.7/src/commands/version.ts)_

<!-- commandsstop -->

Refer to the [examples](#examples) section below for full example with CLI usage.

## Programmatic Usage

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
import { knex } from 'knex';
import { synchronize, loadConfig } from '@leapfrogtechnology/sync-db';

(async () => {
  const config = await loadConfig(); // Load sync-db.yml
  const connection = knex({
    // Your Knex connection instance.
    client: 'mssql',
    connection: {
      host: 'host',
      user: 'userName',
      password: 'password',
      database: 'dbName'
    }
  });
  const options = {
    force: false,
    'skip-migration': false,
    'sync-files': ['functions/dbo/fn_calculate.sql', 'views/dbo/vw_summary.sql'] // Optional: partial sync
  };

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
  - function/<schema_name>/<function_name>.sql.drop # While synchronizing this will only be dropped, not synced.
  - procedure/<schema_name>/<procedure_name>.sql
```

#### Configuration Options

- **`basePath`** `(string)` - Base directory to hold all your SQL & migrations codebase (default: "src").
- **`sql`** `(array)` - A series of SQL file paths that are to be run in ordered sequence (top to bottom), based on dependency. It should be noted that the source files needs to follow this convention of [directory hierarchy](docs/sql.md).
  File paths listed here are relative to `${basePath}/sql` value.
- **`migration`** `(array)` - Migrations specific configurations.

  - **`sourceType`** `(string)` - Type of migration file. Value `defaults` to sql. - **example**: javascript, typescript.
    - TypeScript migrations are compiled on the fly with `ts-node`. With TypeScript 6+ your project needs a `tsconfig.json` (e.g. `module: nodenext`, an explicit `rootDir`) - see the [TypeScript samples](#examples), which include a working `tsconfig.json`.
  - **`tableName`** `(string)` - Custom name for table to store migrations meta data.

- **`connectionResolver`** (`string`) - Connection resolver file name optional if connections are resolved using `connections.sync-db.json`.

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

Connection using **connection-resolver.js**

File consists a `resolve` function which returns an array of connections to the databases. Add the resolver file name to **`connectionResolver`** field in sync-db.yml.

#### Caveat

Setup and Teardown steps aren't always run within a single transaction. **You need to pass the transaction instance object explicitly to make sure this happens.**

```js
await db.transaction(async trx => {
  // Rollback and create all db objects using config.
  await synchronize(config, trx);
});
```

## Examples

1. [Node MSSQL TypeScript Sample](examples/node-app-mssql-ts) - includes [programmatic usage](examples/node-app-mssql-ts/src/sync-db.ts)
2. [Node PostgreSQL TypeScript Sample](examples/node-app-pg-ts) - includes [programmatic usage](examples/node-app-pg-ts/src/sync-db.ts)

## Changelog

Check the [CHANGELOG](CHANGELOG.md) for release history.

## Contributing

Feel free to send pull requests.

## Development

#### Setting up

```bash
# Clone the repository.
$ git clone https://github.com/leapfrogtechnology/sync-db.git

# Go to the project directory.
$ cd sync-db

# Install dependencies. (Notice that we use yarn for this.)
$ yarn
```

#### Building / Testing

```bash
# Generate build.
$ yarn build

# Run tests
$ yarn test

# Invoke the CLI locally (development mode).
$ bin/run-dev.sh
```

#### Release

Publish a new version.

Create a PR updating **version** in package.json to master.

## License

Licensed under [The MIT License](LICENSE).
