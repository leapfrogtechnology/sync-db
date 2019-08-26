import * as Knex from 'knex';

import ConnectionConfig from './domain/ConnectionConfig';
import RawBindingParams, { ValueMap } from './domain/RawBingingParams';

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
  public static withKnex(db: Knex): Connection {
    return new Connection({
      ...db.client.config.connection,
      client: db.client.config.client,
      id: `${db.client.config.connection.host}/${db.client.config.connection.database}`
    });
  }

  /**
   * Returns true if the provided object is a knex connection instance.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  public static isKnexInstance(obj: any): obj is Knex {
    return !!(obj.prototype && obj.prototype.constructor && obj.prototype.constructor.name === 'knex');
  }

  private instance: Knex;
  private config: ConnectionConfig;

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
  public createInstance(): Knex {
    return Knex({
      client: this.config.client,
      connection: this.config
    });
  }

  /**
   * Runs a query.
   *
   * @param {string}  sql
   * @param {RawBindingParams | ValueMap} params
   * @returns {Promise<T[]>}
   */
  public query<T>(sql: string, params: RawBindingParams | ValueMap = []): Promise<T[]> {
    return this.instance.raw(sql, params);
  }

  /**
   * Runs a callback within transaction.
   *
   * @param {(trx: Connection) => any}  callback
   * @returns {any}
   */
  public transaction(callback: (trx: Connection) => any): Promise<any> {
    return this.instance.transaction(trx => callback(Connection.withKnex(trx)));
  }

  /**
   * Returns connection config.
   *
   * @returns {ConnectionConfig}
   */
  public getConfig(): ConnectionConfig {
    return this.config;
  }
}

export default Connection;
