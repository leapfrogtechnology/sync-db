import OperationParams from './operation/OperationParams';
import OperationResult from './operation/OperationResult';

/**
 * Synchronize parameters.
 */
interface SynchronizeParams extends OperationParams {
  force: boolean;
  onMigrationFailed?: (result: OperationResult) => void;
  onMigrationSuccess?: (result: OperationResult) => void;
  onTeardownSuccess?: (result: OperationResult) => void;
  'skip-migration': boolean;
}

export default SynchronizeParams;
