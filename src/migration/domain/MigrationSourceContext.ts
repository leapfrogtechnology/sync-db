import MigrationRunner from './MigrationRunner';

/**
 * A contract for migration source context.
 * All types of migration source types (eg: sql, javascript) implement this contract.
 */
interface MigrationSourceContext {
  connectionId: string;
  keys(): string[];
  get(name: string): MigrationRunner;
  bind(connectionId: string): MigrationSourceContext;
}

export default MigrationSourceContext;
