import * as Knex from 'knex';

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
