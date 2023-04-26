import { Knex } from 'knex';
import { dbLogger, log } from './logger';
import { getConnectionId } from '../config';
import ConnectionConfig from '../domain/ConnectionConfig';
import ConnectionReference from '../domain/ConnectionReference';

/**
 * Database connections given by the user or the CLI frontend.
 */
export type DatabaseConnections = ConnectionConfig[] | ConnectionConfig;

/**
 * Returns true if the provided object is a knex connection instance.
 *
 * TODO: Write tests for this supporting both Knex & Knex.Transaction instances.
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isKnexInstance(obj: any): obj is Knex {
  return !!(obj.prototype && obj.prototype.constructor && obj.prototype.constructor.name === 'knex');
}

/**
 * Extracts the connection config params
 * using provided Knex connection instance.
 *
 * @param {Knex} db
 * @returns {Connection}
 */
export function getConfig(db: Knex): ConnectionConfig {
  return {
    ...db.client.config.connection,
    client: db.client.config.client,
    id: getConnectionId(db.client.config.connection)
  };
}

/**
 * Create a new connection instance (knex) using the connection config.
 * Throws error if the config already holds a Knex's instance.
 *
 * @param {ConnectionConfig} config
 * @returns {Knex}
 */
export function createInstance(config: ConnectionConfig): Knex {
  if (isKnexInstance(config.connection)) {
    throw new Error('The provided connection already contains a connection instance.');
  }

  const { host, database } = config.connection as any;

  log(`Connecting to database: ${host}/${database}`);

  return Knex({
    client: config.client,
    connection: config.connection
  });
}

/**
 * Run a callback function with in a transaction.
 * If `dryRun` is true, transaction will not be committed.
 *
 * @param {ConnectionReference} db
 * @param {(trx: Knex.Transaction) => Promise<T>} callback
 * @param {boolean} dryRun?
 * @returns {Promise<T>}
 */
export async function withTransaction<T>(
  db: ConnectionReference,
  callback: (trx: Knex.Transaction) => Promise<T>,
  dryRun?: boolean
): Promise<T> {
  const dbLog = dbLogger(db.id);

  if (dryRun) {
    dbLog('BEGIN: Dry Run transaction');

    const trx = await db.connection.transaction();
    const res = await callback(trx);

    trx.rollback();

    dbLog('END: Dry Run transaction rolled back successfully');

    return res;
  }

  return db.connection.transaction(async trx => {
    dbLog('BEGIN: transaction');

    const result = await callback(trx);

    dbLog('END: transaction');

    return result;
  });
}

/**
 * Map user provided connection(s) to the connection instances.
 *
 * @param {(DatabaseConnections)} connectionConfig
 * @returns {ConnectionReference[]}
 */
export function mapToConnectionReferences(connectionConfig: DatabaseConnections): ConnectionReference[] {
  const list = Array.isArray(connectionConfig) ? connectionConfig : [connectionConfig];

  return list.map(config => {
    if (isKnexInstance(config.connection)) {
      log(`Received connection instance to database: ${config.connection.client.config.connection.database}`);

      return { connection: config.connection, id: getConnectionId(config) };
    }

    return { connection: createInstance(config), id: getConnectionId(config) };
  });
}
