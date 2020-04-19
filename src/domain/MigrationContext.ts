import MigrationRunner from './MigrationRunner';

/**
 * A contract for migration source context.
 */
interface MigrationContext {
  connectionId: string;
  keys(): string[];
  get(name: string): MigrationRunner;
  bind(connectionId: string): MigrationContext;
}

export default MigrationContext;
