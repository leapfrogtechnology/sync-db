import SyncConfig from './SyncConfig';

/**
 * Synchronize context parameters for the current database connection.
 */
interface SyncContext {
  config: SyncConfig;
  connectionId: string;
}

export default SyncContext;
