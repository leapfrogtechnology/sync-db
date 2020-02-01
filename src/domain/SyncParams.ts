/**
 * Synchronize parameters.
 */
interface SyncParams {
  force: boolean;
  onSuccess: (connectionId: string) => void;
  onFailed: (connectionId: string) => void;
}

export default SyncParams;
