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
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('firstname').notNullable();
    table.string('lastname').notNullable();
    table.string('username').notNullable();
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
