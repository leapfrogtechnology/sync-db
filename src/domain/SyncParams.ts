import ExecutionContext from './ExecutionContext';

/**
 * Synchronize parameters.
 */
interface SyncParams {
  force: boolean;
  onSuccess: (context: ExecutionContext) => Promise<any>;
  onFailed: (context: ExecutionContext) => Promise<any>;
}

export default SyncParams;
