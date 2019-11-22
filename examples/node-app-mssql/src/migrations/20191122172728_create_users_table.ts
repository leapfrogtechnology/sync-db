import * as Knex from 'knex';

/**
 * Create table `users`.
 *
 * @param {Knex} knex
 * @returns {Promise<any>}
 */
export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('users', table => {
    table.increments();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * Drop table `users`.
 *
 * @param {Knex} knex
 * @returns {Promise<any>}
 */
export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('users');
}
