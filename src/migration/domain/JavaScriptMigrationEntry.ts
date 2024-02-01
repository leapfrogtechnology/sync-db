import { Knex } from 'knex';

interface JavaScriptMigrationEntry {
  methods: {
    down: (db: Knex | Knex.Transaction) => Promise<any>;
    up: (db: Knex | Knex.Transaction) => Promise<any>;
  };
  name: string;
}

export default JavaScriptMigrationEntry;
