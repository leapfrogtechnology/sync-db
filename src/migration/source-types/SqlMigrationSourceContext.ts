import { Knex } from 'knex';

import { dbLogger, log as logger } from '../../util/logger';
import MigrationRunner from '../domain/MigrationRunner';
import MigrationSourceContext from '../domain/MigrationSourceContext';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';

/**
 * SQL source migration context for KnexMigrationSource.
 */
class SqlMigrationSourceContext implements MigrationSourceContext {
  public connectionId: string;
  private list: SqlMigrationEntry[];
  private log: debug.Debugger;

  /**
   * SqlMigrationContext constructor.
   *
   * @param {SqlMigrationEntry[]} list - The list of SQL migration entries.
   */
  constructor(list: SqlMigrationEntry[]) {
    this.list = list;
    this.log = logger;
    this.connectionId = '';

    this.log('Instantiated SqlMigrationContext.');
  }

  /**
   * Bind connectionId to the context.
   *
   * @param {string} connectionId - The connectionId to bind.
   * @returns {MigrationSourceContext} this
   */
  bind(connectionId: string): MigrationSourceContext {
    this.connectionId = connectionId;
    this.log = dbLogger(connectionId);

    return this;
  }

  /**
   * Get the migration runner.
   *
   * @param {string} key - The migration key.
   * @returns {MigrationRunner} - The migration runner.
   */
  get(key: string): MigrationRunner {
    // FIX: Optimize - no need to find from the list for every item you get. Map it internally.
    const entry = this.list.find(({ name }) => name === key);

    if (!entry) {
      this.log(`Migration entry not found ${key}.`);

      throw new Error(`Cannot find the migration entry ${key}`);
    }

    const logMigration = this.log.extend('migration');

    return {
      async down(db: Knex) {
        if (entry.queries.down) {
          logMigration(`DOWN - ${key}`);

          return db.raw(entry.queries.down.sql);
        }

        return false;
      },

      async up(db: Knex) {
        if (entry.queries.up) {
          logMigration(`UP - ${key}`);

          return db.raw(entry.queries.up.sql);
        }

        return false;
      }
    };
  }

  /**
   * Get migration keys.
   *
   * @returns {string[]} - The list of migration keys.
   */
  keys(): string[] {
    return this.list.map(({ name }) => name);
  }
}

export default SqlMigrationSourceContext;
