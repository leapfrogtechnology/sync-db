import ExecutionContext from './ExecutionContext';

/**
 * Synchronize parameters.
 */
interface SyncParams {
  force: boolean;
  onSuccess: (context: ExecutionContext) => void;
  onFailed: (context: ExecutionContext) => void;
}

export default SyncParams;
