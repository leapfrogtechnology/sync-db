import * as Knex from 'knex';

import ConnectionConfig from './domain/ConnectionConfig';

/**
 * Connection class wrapper with
 * both config and instance property.
 */
class Connection {
  /**
   * Creates new Connection object
   * using provided Knex connection instance.
   *
   * @param {Knex} db
   * @returns {Connection}
   */
  static withKnex(db: Knex): Connection {
    if (!this.isKnexInstance(db)) {
      throw new Error('Provided argument is not a valid knex instance.');
    }

    return new Connection({
      ...db.client.config.connection,
      client: db.client.config.client,
      id: db.client.config.connection.database
    });
  }

  /**
   * Returns true if the provided object is a knex connection instance.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  static isKnexInstance(obj: any): obj is Knex {
    return !!(obj.prototype && obj.prototype.constructor && obj.prototype.constructor.name === 'knex');
  }

  instance: Knex;
  config: ConnectionConfig;

  /**
   * Constructor.
   *
   * @param {ConnectionConfig} config
   */
  constructor(config: ConnectionConfig) {
    this.config = config;
    this.instance = this.createInstance();
  }

  /**
   * Creates a connection instance from
   * the provided database configuration.
   *
   * @param {ConnectionConfig} connectionConfig
   * @returns {Knex}
   */
  createInstance(): Knex {
    return Knex({
      client: this.config.client,
      connection: this.config
    });
  }

}

export default Connection;
