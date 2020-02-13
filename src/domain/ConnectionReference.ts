import * as Knex from 'knex';

/**
 * Connection reference.
 */
interface ConnectionReference {
  connection: Knex;
  id: string;
}

export default ConnectionReference;
