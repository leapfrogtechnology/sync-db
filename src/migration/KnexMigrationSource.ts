import { Knex } from 'knex';

import { dbLogger } from '../util/logger';
import MigrationRunner from './domain/MigrationRunner';
import MigrationSourceContext from './domain/MigrationSourceContext';

/**
 * Migration source class for the Knex Migration API.
 * An instance of this class is passed to the knex's migration config as `migrationSource`.
 *
 * Reference: http://knexjs.org/#Migrations-API
 */
class KnexMigrationSource implements Knex.MigrationSource<string> {
  private log: debug.Debugger;
  private migrationContext: MigrationSourceContext;

  /**
   * KnexMigrationSource constructor.
   *
   * @param {MigrationEntry[]} migrationLists
   */
  constructor(migrationContext: MigrationSourceContext) {
    this.log = dbLogger(migrationContext.connectionId);
    this.migrationContext = migrationContext;
  }

  /**
   * Get the migration runner.
   *
   * @param {string} name
   * @returns {Promise<MigrationRunner>}
   */
  getMigration(name: string): Promise<MigrationRunner> {
    const migration = this.migrationContext.get(name);

    this.log(`getMigration - ${name}`);
    this.log(`getMigration - resolve: %o`, migration);

    return Promise.resolve(migration);
  }

  /**
   * Gets the name of the migration.
   *
   * @param {string} migration
   * @returns {string}
   */
  getMigrationName(migration: string): string {
    return migration;
  }

  /**
   * Gets a list of migration names.
   *
   * @returns {Promise<string[]>}
   */
  getMigrations(): Promise<string[]> {
    const migrations = this.migrationContext.keys();

    this.log('getMigrations - resolve:\n%O', migrations);

    return Promise.resolve(migrations);
  }
}

export default KnexMigrationSource;
