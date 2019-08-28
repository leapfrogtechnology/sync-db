import * as Knex from 'knex';

/**
 * Database connection instances.
 */
type DbConnectionInstance = Knex | Knex.Transaction;

export default DbConnectionInstance;
