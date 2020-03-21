import * as Knex from 'knex';

import { log } from './util/logger';
import * as migratorService from '../src/service/migrator';
import SqlMigrationEntry from './domain/SqlMigrationEntry';

/**
 * MigrationSource class for the Knex Migration API.
 */
class KnexMigrationSource {
  /**
   * Migration directory path.
   * @type {string}
   */
  private migrationPath: string;

  /**
   * Creates an instance of KnexMigrationSource.
   *
   * @param {MigrationEntry[]} migrationLists
   */
  constructor(migrationPath: string) {
    log('Creating new KnexMigrationSource with path:', migrationPath);

    this.migrationPath = migrationPath;
  }

  /**
   * Gets a list of migration entries.
   *
   *
   * @returns {Promise<SqlMigrationEntry[]>}
   */
  async getMigrations(): Promise<SqlMigrationEntry[]> {
    const migrations = await migratorService.resolveSqlMigrations(this.migrationPath);

    log('Resolved migrations', migrations);

    return migrations;
  }

  /**
   * Get the name of the migration entry.
   *
   * @param {SqlMigrationEntry} migration
   * @returns {string}
   * @memberof KnexMigrationSource
   */
  getMigrationName(migration: SqlMigrationEntry): string {
    log(`Returning migration name: ${migration.name}`);

    return migration.name;
  }

  /**
   * Get the migration functions.
   *
   * @param {SqlMigrationEntry} migration
   */
  getMigration(migration: SqlMigrationEntry) {
    const { queries } = migration;

    return {
      up: (db: Knex) => (queries.up ? db.raw(queries.up.sql) : Promise.resolve()),
      down: (db: Knex) => (queries.down ? db.raw(queries.down.sql) : Promise.resolve())
    };
  }
}

export default KnexMigrationSource;
