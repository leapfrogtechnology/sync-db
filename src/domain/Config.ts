import ConnectionConfig from './ConnectionConfig';

/**
 * Interface for sync-db connection file (connections.sync-db.json).
 */
interface Config {
  connections: ConnectionConfig[];
}

export default Config;
