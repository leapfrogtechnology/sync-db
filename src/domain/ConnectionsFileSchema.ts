import ConnectionConfig from './ConnectionConfig';

/**
 * Interface for sync-db connection file (connections.sync-db.json).
 */
interface ConnectionsFileSchema {
  connections: ConnectionConfig[];
}

export default ConnectionsFileSchema;
