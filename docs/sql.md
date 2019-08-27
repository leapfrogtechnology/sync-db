# SQL

This utility expects all your database scripts and objects (schemas, views, procedures, functions, etc) be defined as SQL source files.

Additionally, your sql source files are expected to follow the opinionated [directory structure](#directory-structure) as shown below under the sql base directory.

By default the sql base directory i.e `basePath` is `src/sql` unless changed via [configuration](../README.md#configuration).

## Directory Structure

The SQL source directory structure.

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

**Note: When the object sql files aren't placed under the directories named after the schema, they are associated with the default schema.**
