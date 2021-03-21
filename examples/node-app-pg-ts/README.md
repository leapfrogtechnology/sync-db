# Node PostgreSQL Example with TypeScript Migrations

Sample project for sync-db using PostgreSQL and migrations written in TypeScript.

## Overview

This `sync-db` example does a few things in order:

- Prunes database objects inside of [src/sql](src/sql) from the specified database connection(s) if it exists.
- Executes knex database migrations inside of [src/migrations](src/migrations) directory written in TypeScript.
- Creates database objects inside of [src/sql](src/sql) directory using `sync-db`. These database objects are created in the order specified in [sync-db.yml](sync-db.yml).
- Executes a [node script](src/index.js) to check if the synchronized objects can be executed and prints the result.

## Setup

Setup will require [docker](https://docs.docker.com/engine/) and [docker-compose](https://docs.docker.com/compose/gettingstarted/).

Configure database connection(s) in `connections.sync-db.json` by copying `connections.sync-db.json.example`. For ease of use, the example app will work without making any changes to `connections.sync-db.json`. Throwaway database credentials have been set in [docker-compose.yml](docker-compose.yml).

```bash
$ cp connections.sync-db.json.example connections.sync-db.json
```

## Run

Run the docker-compose services in order.

```bash
$ docker-compose up -d db
$ docker-compose up app
```

## Output

```bash
example-app | yarn run v1.22.5
example-app | $ /app/node_modules/.bin/sync-db synchronize
example-app | Synchronizing...
example-app |
example-app |  ▸ db1
example-app |    [✓] Synchronization - started
example-app |    [✓] Synchronization - pruned (0s)
example-app |    [✓] Migrations - up to date (0.02s)
example-app |    [✓] Synchronization - completed (0.13s)
example-app |
example-app | Synchronization complete for 1 / 1 connection(s). (0.25s)
example-app |
example-app | Done in 0.54s.
example-app | yarn run v1.22.5
example-app | $ node src/index.js
example-app |
example-app | List of table names in the database:
example-app |  [ 'knex_migrations', 'knex_migrations_lock', 'users', 'todos' ]
example-app |
example-app | List of user names in the database:
example-app |  [ 'sync' ]
example-app |
example-app | Calculations:
example-app |  { 'Sum of 6 and 7': 13, 'Square of 6': 36, 'Product of 6 and 7': 42 }
example-app |
example-app | Current date time: 2021-03-21T00:00:00.000Z
example-app | Done in 0.11s.
example-app exited with code 0
```
