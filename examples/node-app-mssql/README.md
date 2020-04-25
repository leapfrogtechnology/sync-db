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

## Running

**Synchronization**

Run `synchronize` to run migrations and synchronize all database objects (views, functions, procedures, schemas, etc) in the configured database(s).

```
$ yarn synchronize
```
```
Synchronizing...

 ▸ testdb1
   [✓] Synchronization - started
   [✓] Synchronization - pruned (0.02s)
   [✓] Migrations - 2 run (0.03s)
       - 20191124213750_create_users_table
       - 20191124213800_create_tasks_table
   [✓] Synchronization - completed (0.15s)

 ▸ testdb2
   [✓] Synchronization - started
   [✓] Synchronization - pruned (0.01s)
   [✓] Migrations - 2 run (0.02s)
       - 20191124213750_create_users_table
       - 20191124213800_create_tasks_table
   [✓] Synchronization - completed (0.13s)

Synchronization complete for 2 / 2 connection(s). (0.51s)
```

**Running Sample App**

Run the sample node app.

```
$ yarn start
```


**Output**

```
List of users:
 [ 'user1@example.com',
  'user2@example.com',
  'user3@example.com',
  'user4@example.com' ]

List of completed tasks:
 [ { id: 21,
    user_id: 1,
    title: 'Task 1',
    description: 'This is task 1.',
    is_complete: true,
    created_at: null,
    updated_at: null },
  { id: 27,
    user_id: 2,
    title: 'Task 7',
    description: 'This is task 7.',
    is_complete: true,
    created_at: null,
    updated_at: null },
  { id: 30,
    user_id: 2,
    title: 'Task 10',
    description: 'This is task 10.',
    is_complete: true,
    created_at: null,
    updated_at: null },
  { id: 35,
    user_id: 3,
    title: 'Task 15',
    description: 'This is task 15.',
    is_complete: true,
    created_at: null,
    updated_at: null } ]

Calculations:
 { 'Sum of 6 and 7': 13,
  'Product of 6 and 7': 42,
  'Square of 6': 36 }

Current date time: 2020-04-25T19:02:38.320Z
```

## Docker

Set `DB_PASSWORD` (password for `SA` user) in environment. e.g.

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
$ docker-compose up -d mssql
$ docker-compose up app
```
