import SyncConfig from './SyncConfig';
import SyncParams from './SyncParams';

/**
 * Synchronize context parameters for the current database connection.
 */
interface SyncContext {
  config: SyncConfig;
  connectionId: string;
  params: SyncParams;
}

export default SyncContext;
