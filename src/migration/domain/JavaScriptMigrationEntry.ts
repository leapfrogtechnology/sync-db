import Knex from "knex";

interface JavaScriptMigrationEntry {
  name: string;
  queries: {
    up: (db: Knex | Knex.Transaction) => Promise<any>;
    down: (db: Knex | Knex.Transaction) => Promise<any>;
  };
}

export default JavaScriptMigrationEntry
