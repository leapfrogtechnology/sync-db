import Connection from './Connection'

/**
 * Interface for sync-db connection file (connections.sync-db.json).
 */
interface ConnectionConfig {
  connections: Connection[];
}

export default ConnectionConfig;
