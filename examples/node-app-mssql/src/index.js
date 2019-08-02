/**
 * Demonstrates use of sync-db to create functions, procedures and views in MSSQL.
 */
const knex = require('knex');
const connections = require('../connections.sync-db.json');

(async () => {
  try {
    // Getting knex instance of mssql database with id db1.
    const db = knex({
      client: 'mssql',
      connection: connections.find(({ id }) => id === 'db1')
    });

    const tables = await db.raw('SELECT * FROM utils.vw_table_names');
    const users = await db.raw('SELECT * FROM utils.vw_user_names');
    const [{ result: product }] = await db.raw('SELECT utils.product(6, 7) AS result;');
    const [{ result: date }] = await db.raw('EXEC utils.get_date;');

    console.log('List of table names in the database.', tables);

    console.log('List of user names in the database.', users);

    console.log('Product of 6 and 7 is', product);

    console.log('Current date time is ', date);

    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
})();
