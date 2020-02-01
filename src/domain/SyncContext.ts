/**
 * Synchronize context parameters for the current database connection.
 */
interface SyncContext {
  config: SyncContext;
  connection: {
    id: string;
    client: string;
    database: string;
  };
}

export default SyncContext;
