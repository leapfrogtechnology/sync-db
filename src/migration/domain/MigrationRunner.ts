import { Knex } from 'knex';

/**
 * Contract for a migration runner.
 */
interface MigrationRunner {
  down: (db: Knex | Knex.Transaction) => Promise<any>;
  up: (db: Knex | Knex.Transaction) => Promise<any>;
}

export default MigrationRunner;
