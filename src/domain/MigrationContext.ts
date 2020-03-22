import MigrationRunner from './MigrationRunner';

/**
 * A contract for migration source context.
 */
interface MigrationContext {
  connectionId: string;
  keys(): string[];
  get(name: string): MigrationRunner;
}

export default MigrationContext;
