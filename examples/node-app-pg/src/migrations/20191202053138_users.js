exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('userId');
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('firstname').notNullable();
    table.string('lastname').notNullable();
    table.string('username').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
