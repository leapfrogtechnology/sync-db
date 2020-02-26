import SyncConfig from './SyncConfig';
import SyncParams from './SyncParams';

/**
 * Synchronize context parameters for the current database connection.
 */
interface SyncContext {
  config: SyncConfig;
  connectionId: string;
  isCLI: boolean;
  params: SyncParams;
}

export default SyncContext;
