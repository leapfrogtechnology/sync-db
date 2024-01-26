import { dbLogger, log as logger } from '../../util/logger';
import JavaScriptMigrationEntry from '../domain/JavaScriptMigrationEntry';
import MigrationRunner from '../domain/MigrationRunner';
import MigrationSourceContext from '../domain/MigrationSourceContext';

/**
 * JavaScript source migration context for KnexMigrationSource.
 */
class JavaScriptMigrationContext implements MigrationSourceContext {
  public connectionId: string;
  private list: JavaScriptMigrationEntry[];
  private log: debug.Debugger;

  /**
   * JavaScriptMigrationContext constructor.
   *
   * @param {JavaScriptMigrationEntry[]} list
   */
  constructor(list: JavaScriptMigrationEntry[]) {
    this.list = list;
    this.log = logger;
    this.connectionId = '';

    this.log('Instantiated JavaScript/TypeScript migration context.');
  }

  /**
   * Bind connectionId to the context.
   *
   * @param {string} connectionId
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

    return {
      down: entry.methods.down,
      up: entry.methods.up
    };
  }

  /**
   * Get migration keys.
   *
   * @returns {string[]}
   */
  keys(): string[] {
    return this.list.map(({ name }) => name);
  }
}

export default JavaScriptMigrationContext;
