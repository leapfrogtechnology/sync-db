import { getConfig, createInstance } from './util/db';
import ConnectionConfig from './domain/ConnectionConfig';
import ConnectionInstance from './domain/ConnectionInstance';

/**
 * Connection class wrapper with
 * both config and instance property.
 */
class Connection {
  /**
   * Creates new Connection object
   * using provided ConnectionInstance.
   *
   * @param {ConnectionInstance} db
   * @returns {Connection}
   */
  static withInstance(db: ConnectionInstance): Connection {
    return new Connection(getConfig(db));
  }

  config: ConnectionConfig;
  instance: ConnectionInstance;

  /**
   * Constructor.
   *
   * @param {ConnectionConfig} config
   */
  constructor(config: ConnectionConfig) {
    this.config = config;
    this.instance = createInstance(config);
  }
}

export default Connection;
