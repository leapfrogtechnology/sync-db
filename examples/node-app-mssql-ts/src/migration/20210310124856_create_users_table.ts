import * as Knex from 'knex';

/**
 * Create users table.
 *
 * @param {Knex} db
 * @returns {Promise}
 */
export function up(db: Knex) {
  return db.schema.createTable('users', table => {
    table.increments('id');
    table.string('email');
    table.string('password');
    table.string('firstname');
    table.string('lastname');
    table.string('username');
    table.timestamp('created_at').defaultTo(db.fn.now());
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });
}

/**
 * Drop users table.
 *
 * @param {Knex} db
 * @returns {Promise}
 */
export function down(db: Knex) {
  return db.schema.dropTable('users');
}
