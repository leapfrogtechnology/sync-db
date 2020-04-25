import { dbLogger } from '../util/logger';
import MigrationContext from '../domain/migration/MigrationContext';

/**
 * MigrationSource class for the Knex Migration API.
 */
class KnexMigrationSource {
  private migrationContext: MigrationContext;
  private log: debug.Debugger;

  /**
   * KnexMigrationSource constructor.
   *
   * @param {MigrationEntry[]} migrationLists
   */
  constructor(migrationContext: MigrationContext) {
    this.log = dbLogger(migrationContext.connectionId);
    this.migrationContext = migrationContext;
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

  /**
   * Gets the name of the migration.
   *
   * @param {string} migration
   * @returns {string}
   */
  getMigrationName(migration: string): string {
    this.log('getMigrationName - resolve: ', migration);

    return migration;
  }

  /**
   * Get the migration runner.
   *
   * @param {SqlMigrationEntry} migration
   */
  getMigration(name: string) {
    const migration = this.migrationContext.get(name);

    this.log(`getMigration - ${name}`);
    this.log(`getMigration - resolve: %o`, migration);

    return migration;
  }
}

export default KnexMigrationSource;
