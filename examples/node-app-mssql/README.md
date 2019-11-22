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

Run the command below to perform a migration:
```
$ yarn migrate
```

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
 [ 'knex_migrations', 'knex_migrations_lock', 'users', 'tasks' ]

List of user names in the database:
 [
  'sa',
  'public',
  'sysadmin',
  'securityadmin',
  'serveradmin',
  'setupadmin',
  'processadmin',
  'diskadmin',
  'dbcreator',
  'bulkadmin',
  '##MS_SQLResourceSigningCertificate##',
  '##MS_SQLReplicationSigningCertificate##',
  '##MS_SQLAuthenticatorCertificate##',
  '##MS_PolicySigningCertificate##',
  '##MS_SmoExtendedSigningCertificate##',
  '##MS_PolicyEventProcessingLogin##',
  '##MS_PolicyTsqlExecutionLogin##',
  '##MS_AgentSigningCertificate##',
  'BUILTIN\\Administrators',
  'NT AUTHORITY\\NETWORK SERVICE',
  'NT AUTHORITY\\SYSTEM'
]

Calculations:
 { 'Sum of 6 and 7': 13, 'Product of 6 and 7': 42, 'Square of 6': 36 }

Current date time: 2019-11-22T11:52:29.237Z
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
$ docker-compose up mssql
$ docker-compose up app
```
