import Configuration from './Configuration';
import SyncParams from './SyncParams';

/**
 * Synchronize context parameters for the current database connection.
 */
interface SyncContext {
  config: Configuration;
  connectionId: string;
  params: SyncParams;
}

export default SyncContext;
