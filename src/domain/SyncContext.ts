import SyncConfig from './SyncConfig';
import SyncParams from './SyncParams';
import SourceTree from './SourceTree';

/**
 * Synchronize context parameters for the current database connection.
 */
interface SyncContext {
  config: SyncConfig;
  connectionId: string;
  isCLI: boolean;
  params: SyncParams;
  source: SourceTree;
}

export default SyncContext;
