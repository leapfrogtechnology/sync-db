import { Knex } from 'knex';

interface JavaScriptMigrationEntry {
  name: string;
  methods: {
    up: (db: Knex | Knex.Transaction) => Promise<any>;
    down: (db: Knex | Knex.Transaction) => Promise<any>;
  };
}

export default JavaScriptMigrationEntry;
