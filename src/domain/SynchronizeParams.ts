import OperationParams from './operation/OperationParams';
import OperationResult from './operation/OperationResult';

/**
 * Synchronize parameters.
 */
interface SynchronizeParams extends OperationParams {
  force: boolean;
  'skip-migration': boolean;
  onTeardownSuccess?: (result: OperationResult) => Promise<any>;
  onMigrationSuccess?: (result: OperationResult) => Promise<any>;
  onMigrationFailed?: (result: OperationResult) => Promise<any>;
}

export default SynchronizeParams;
