# Node MSSQL Example with JavaScript Migrations

Sample project for sync-db using MSSQL and migrations written in JavaScript.

## Overview

This `sync-db` example does a few things in order:

- Prunes database objects inside of [src/sql](src/sql) from the specified database connection(s) if it exists.
- Executes knex database migrations inside of [src/migrations](src/migrations) directory written in JavaScript.
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
example-app |  ▸ testdb1
example-app |    [✓] Synchronization - started
example-app |    [✓] Synchronization - pruned (0.05s)
example-app |    [✓] Migrations - up to date (0.06s)
example-app |    [✓] Synchronization - completed (0.23s)
example-app |
example-app | Synchronization complete for 1 / 1 connection(s). (1.07s)
example-app |
example-app | Done in 1.99s.
example-app | yarn run v1.22.5
example-app | $ node src/index.js
example-app |
example-app | List of users:
example-app |  [
example-app |   'user1@example.com',
example-app |   'user2@example.com',
example-app |   'user3@example.com',
example-app |   'user4@example.com'
example-app | ]
example-app |
example-app | List of completed tasks:
example-app |  [
example-app |   {
example-app |     id: 21,
example-app |     title: 'Task 1',
example-app |     user_id: 1,
example-app |     description: 'This is task 1.',
example-app |     is_complete: true,
example-app |     created_at: 2021-03-22T09:06:27.906Z,
example-app |     updated_at: 2021-03-22T09:06:27.906Z
example-app |   },
example-app |   {
example-app |     id: 27,
example-app |     title: 'Task 7',
example-app |     user_id: 2,
example-app |     description: 'This is task 7.',
example-app |     is_complete: true,
example-app |     created_at: 2021-03-22T09:06:27.906Z,
example-app |     updated_at: 2021-03-22T09:06:27.906Z
example-app |   },
example-app |   {
example-app |     id: 30,
example-app |     title: 'Task 10',
example-app |     user_id: 2,
example-app |     description: 'This is task 10.',
example-app |     is_complete: true,
example-app |     created_at: 2021-03-22T09:06:27.906Z,
example-app |     updated_at: 2021-03-22T09:06:27.906Z
example-app |   },
example-app |   {
example-app |     id: 35,
example-app |     title: 'Task 15',
example-app |     user_id: 3,
example-app |     description: 'This is task 15.',
example-app |     is_complete: true,
example-app |     created_at: 2021-03-22T09:06:27.906Z,
example-app |     updated_at: 2021-03-22T09:06:27.906Z
example-app |   }
example-app | ]
example-app |
example-app | Calculations:
example-app |  { 'Sum of 6 and 7': 13, 'Square of 6': 36, 'Product of 6 and 7': 42 }
example-app |
example-app | Current date time: 2021-03-22T09:06:28.930Z
example-app exited with code 0
```
