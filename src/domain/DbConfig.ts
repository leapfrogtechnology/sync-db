import ConnectionConfig from './ConnectionConfig';

/**
 * Interface for sync-db connection file (connections.sync-db.json).
 */
interface DbConfig {
  connections: ConnectionConfig[];
}

export default DbConfig;
