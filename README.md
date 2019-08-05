# sync-db

Command line utility to synchronize and version control relational database objects across databases.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@leapfrogtechnology/sync-db.svg)](https://npmjs.org/package/@leapfrogtechnology/sync-db)
[![Downloads/week](https://img.shields.io/npm/dw/@leapfrogtechnology/sync-db.svg)](https://npmjs.org/package/@leapfrogtechnology/sync-db)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/laudio/sync-db.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/laudio/sync-db/context:javascript)
[![License](https://img.shields.io/npm/l/@leapfrogtechnology/sync-db.svg)](https://github.com/kabirbaidhya/sync-db/blob/master/package.json)

# Setup

## Installation

    $ yarn add @leapfrogtechnology/sync-db

Install node database driver(s) of the database(s) that are to be synced in your project, for example this is how you would install the mssql driver:

    $ yarn add mssql

## Configure Database Connections

Create `connections-sync-db.json` in your project folder and configure your database connection(s) to be synced.

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

## Configure Path To SQL Database Objects

1. Copy the SQL files in your project in following folder structure.

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
basePath: /path/to/sql
sql:
  - schema/<schema_name>.sql
  - function/<schema_name>/<function_name>.sql
  - procedure/<schema_name>/<procedure_name>.sql
```

**Note: Default basePath is `src/sql`.**

3. Specify the base path of the folder for SQL files in `basePath` key.

4. List database objects in the order they need to be synced under the `sql` key.

# Usage

Add script in your `package.json`
```json
{
  "name": "my-package",
  "scripts": {
    "sync-db": "sync-db",
  }
}
```

Run

```bash
$ yarn sync-db
```

# Sample Projects

1. [Node MSSQL Sample (JavaScript)](examples/node-app-mssql)

# License

Licensed under [The MIT License](LICENSE).
