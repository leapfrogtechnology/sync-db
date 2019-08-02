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
    const [{ result: sum }] = await db.raw('SELECT dbo.sum(6, 7) AS result;');
    const [{ result: square }] = await db.raw('SELECT dbo.square(6) AS result;');
    const [{ result: date }] = await db.raw('EXEC utils.get_date;');

    console.log('List of table names in the database:\n', tables.map(({ name }) => name));
    console.log('List of user names in the database.\n', users.map(({ name }) => name));
    console.log('Calculations:\n', {
      'Sum of 6 and 7 is': sum,
      'Product of 6 and 7 is': product,
      'Square of 6 is': square
    });
    console.log('Current date time is ', date);

    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
})();
