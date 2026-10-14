import MigrationRunner from '../domain/MigrationRunner';
import { dbLogger, log as logger } from '../../util/logger';
import MigrationSourceContext from '../domain/MigrationSourceContext';
import JavaScriptMigrationEntry from '../domain/JavaScriptMigrationEntry';

/**
 * JavaScript source migration context for KnexMigrationSource.
 */
class JavaScriptMigrationContext implements MigrationSourceContext {
  private list: JavaScriptMigrationEntry[];
  private entries: Map<string, JavaScriptMigrationEntry>;
  private log: debug.Debugger;
  public connectionId: string;

  /**
   * JavaScriptMigrationContext constructor.
   *
   * @param {JavaScriptMigrationEntry[]} list
   * @param {Map<string, JavaScriptMigrationEntry>} [entries] Pre-built lookup, shared between bound copies.
   */
  constructor(list: JavaScriptMigrationEntry[], entries?: Map<string, JavaScriptMigrationEntry>) {
    this.list = list;
    this.entries = entries ?? new Map(list.map(entry => [entry.name, entry]));
    this.log = logger;
    this.connectionId = '';

    this.log('Instantiated JavaScript/TypeScript migration context.');
  }

  /**
   * Bind connectionId to the context.
   * Returns a new context so that connections running in parallel don't share (and overwrite) state.
   *
   * @param {string} connectionId
   * @returns {MigrationSourceContext}
   */
  bind(connectionId: string): MigrationSourceContext {
    const bound = new JavaScriptMigrationContext(this.list, this.entries);

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

    return {
      up: entry.methods.up,
      down: entry.methods.down
    };
  }
}

export default JavaScriptMigrationContext;
