import MigrationRunner from './MigrationRunner';

/**
 * A contract for migration source context.
 * All types of migration source types (eg: sql, javascript) implement this contract.
 */
interface MigrationSourceContext {
  bind(connectionId: string): MigrationSourceContext;
  connectionId: string;
  get(name: string): MigrationRunner;
  keys(): string[];
}

export default MigrationSourceContext;
