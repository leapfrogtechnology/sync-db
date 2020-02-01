/**
 * Synchronize result for a database connection.
 */
interface SyncResult {
  success: boolean;
  connectionId: string;
  error?: any;
}

export default SyncResult;
