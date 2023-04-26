import { Knex } from 'knex';

/**
 * Contract for a migration runner.
 */
interface MigrationRunner {
  up: (db: Knex | Knex.Transaction) => Promise<any>;
  down: (db: Knex | Knex.Transaction) => Promise<any>;
}

export default MigrationRunner;
