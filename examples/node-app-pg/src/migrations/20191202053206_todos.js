/**
 * Create table `todos`.
 *
 * @param {Knex} knex
 * @returns {Promise<any>}
 */
exports.up = knex => {
  return knex.schema.createTable('todos', table => {
    table.increments('id');
    table.string('name').notNullable();
    table.enu('status', ['active', 'inactive']).notNullable();
    table.foreign('user').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * Drop table `users`.
 *
 * @param {Knex} knex
 * @returns {Promise<any>}
 */
exports.down = knex => {
  return knex.schema.dropTable('todos');
};
