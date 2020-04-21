import ExecutionContext from './ExecutionContext';
import { MigrationResult } from '../service/knexMigrator';

/**
 * Synchronize parameters.
 */
interface SynchronizeParams {
  force: boolean;
  'skip-migration': boolean;
  onStarted?: (context: ExecutionContext) => Promise<any>;
  onSuccess?: (context: ExecutionContext) => Promise<any>;
  onTeardownSuccess?: (context: ExecutionContext) => Promise<any>;
  onFailed?: (context: ExecutionContext) => Promise<any>;
  onMigrationSuccess?: (result: MigrationResult) => Promise<any>;
  onMigrationFailed?: (result: MigrationResult) => Promise<any>;
}

export default SynchronizeParams;
