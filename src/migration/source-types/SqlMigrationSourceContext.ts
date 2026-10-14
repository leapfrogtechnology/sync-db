import { Knex } from 'knex';

import MigrationRunner from '../domain/MigrationRunner';
import { dbLogger, log as logger } from '../../util/logger';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';
import MigrationSourceContext from '../domain/MigrationSourceContext';

/**
 * SQL source migration context for KnexMigrationSource.
 */
class SqlMigrationSourceContext implements MigrationSourceContext {
  private list: SqlMigrationEntry[];
  private entries: Map<string, SqlMigrationEntry>;
  private log: debug.Debugger;
  public connectionId: string;

  /**
   * SqlMigrationContext constructor.
   *
   * @param {SqlMigrationEntry[]} list
   * @param {Map<string, SqlMigrationEntry>} [entries] Pre-built lookup, shared between bound copies.
   */
  constructor(list: SqlMigrationEntry[], entries?: Map<string, SqlMigrationEntry>) {
    this.list = list;
    this.entries = entries ?? new Map(list.map(entry => [entry.name, entry]));
    this.log = logger;
    this.connectionId = '';

    this.log('Instantiated SqlMigrationContext.');
  }

  /**
   * Bind connectionId to the context.
   * Returns a new context so that connections running in parallel don't share (and overwrite) state.
   *
   * @param {string} connectionId
   * @returns {MigrationSourceContext}
   */
  bind(connectionId: string): MigrationSourceContext {
    const bound = new SqlMigrationSourceContext(this.list, this.entries);

    bound.connectionId = connectionId;
    bound.log = dbLogger(connectionId);

    return bound;
  }

  /**
   * Get migration keys.
   *
   * @returns {string[]}
   */
  keys(): string[] {
    return this.list.map(({ name }) => name);
  }

  /**
   * Get the migration runner.
   *
   * @param {string} key
   * @returns {MigrationRunner}
   */
  get(key: string): MigrationRunner {
    const entry = this.entries.get(key);

    if (!entry) {
      this.log(`Migration entry not found ${key}.`);

      throw new Error(`Cannot find the migration entry ${key}`);
    }

    const logMigration = this.log.extend('migration');

    return {
      up: async (db: Knex) => {
        if (entry.queries.up) {
          logMigration(`UP - ${key}`);

          return db.raw(entry.queries.up.sql);
        }

        return false;
      },

      down: async (db: Knex) => {
        if (entry.queries.down) {
          logMigration(`DOWN - ${key}`);

          return db.raw(entry.queries.down.sql);
        }

        return false;
      }
    };
  }
}

export default SqlMigrationSourceContext;
