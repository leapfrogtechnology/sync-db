import { Knex } from 'knex';

/**
 * Create todos table.
 *
 * @param {Knex} db
 * @returns {Promise}
 */
export function up(db: Knex) {
  return db.schema.createTable('todos', table => {
    table.increments('id');
    table.string('name').notNullable();
    table.enu('status', ['active', 'inactive']).notNullable();
    table.integer('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(db.fn.now());
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });
}

/**
 * Drop todos table.
 *
 * @param {Knex} db
 * @returns {Promise}
 */
export function down(db: Knex) {
  return db.schema.dropTable('todos');
}
