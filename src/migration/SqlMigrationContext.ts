import * as Knex from 'knex';

import MigrationRunner from '../domain/MigrationRunner';
import { dbLogger, log as logger } from '../util/logger';
import MigrationContext from '../domain/MigrationContext';
import SqlMigrationEntry from '../domain/SqlMigrationEntry';

/**
 * SQL source migration context for KnexMigrationSource.
 */
class SqlMigrationContext implements MigrationContext {
  private list: SqlMigrationEntry[];
  private log: debug.Debugger;
  public connectionId: string;

  /**
   * SqlMigrationContext constructor.
   *
   * @param {SqlMigrationEntry[]} list
   */
  constructor(list: SqlMigrationEntry[]) {
    this.list = list;
    this.log = logger;
    this.connectionId = '';
  }

  /**
   * Bind connectionId to the context.
   *
   * @param {string} connectionId
   * @returns {MigrationContext} this
   */
  bind(connectionId: string): MigrationContext {
    this.connectionId = connectionId;
    this.log = dbLogger(connectionId);

    return this;
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
    // TODO: Optimize - no need to find from the list for every item you get. Map it internally.
    const entry = this.list.find(({ name }) => name === key);

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

export default SqlMigrationContext;
