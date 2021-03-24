# Node MSSQL Programmatic API Example (JavaScript)

Sample project for Microsoft SQL Server using programmatic API.

## Setup

Install dependencies.

```bash
$ yarn
```

Configure database connection(s) in the `connections.sync-db.json`.

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
example-app |    [✓] Synchronization - pruned (0.04s)
example-app |    [✓] Migrations - up to date (0.07s)
example-app |    [✓] Synchronization - completed (0.14s)
example-app |
example-app | Synchronization complete for 1 / 1 connection(s). (1.01s)
example-app |
example-app | Done in 1.64s.
example-app | yarn run v1.22.5
example-app | $ node src/index.js
example-app |
example-app | List of table names in the database:
example-app |  [ 'knex_migrations', 'knex_migrations_lock', 'users', 'tasks' ]
example-app |
example-app | List of user names in the database:
example-app |  [
example-app |   'sa',
example-app |   'public',
example-app |   'sysadmin',
example-app |   'securityadmin',
example-app |   'serveradmin',
example-app |   'setupadmin',
example-app |   'processadmin',
example-app |   'diskadmin',
example-app |   'dbcreator',
example-app |   'bulkadmin',
example-app |   '##MS_SQLResourceSigningCertificate##',
example-app |   '##MS_SQLReplicationSigningCertificate##',
example-app |   '##MS_SQLAuthenticatorCertificate##',
example-app |   '##MS_PolicySigningCertificate##',
example-app |   '##MS_SmoExtendedSigningCertificate##',
example-app |   '##MS_PolicyEventProcessingLogin##',
example-app |   '##MS_PolicyTsqlExecutionLogin##',
example-app |   '##MS_AgentSigningCertificate##',
example-app |   'BUILTIN\\Administrators',
example-app |   'NT AUTHORITY\\SYSTEM',
example-app |   'NT AUTHORITY\\NETWORK SERVICE'
example-app | ]
example-app |
example-app | Calculations:
example-app |  { 'Sum of 6 and 7': 13, 'Square of 6': 36, 'Product of 6 and 7': 42 }
example-app |
example-app | Current date time: 2021-03-24T11:36:39.230Z
example-app | Done in 0.95s.
example-app exited with code 0
```
