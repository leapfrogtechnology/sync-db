import * as Knex from 'knex';

/**
 * Create tasks table.
 *
 * @param {Knex} db
 * @returns {Promise}
 */
export function up(db: Knex) {
  return db.schema.createTable('tasks', table => {
    table.increments('id');
    table.string('title').notNullable();
    table.integer('user_id').notNullable();
    table.string('description').notNullable();
    table.boolean('is_complete').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(db.fn.now());
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });
}

/**
 * Drop tasks table.
 *
 * @param {Knex} db
 * @returns {Promise}
 */
export function down(db: Knex) {
  return db.schema.dropTable('tasks');
}
