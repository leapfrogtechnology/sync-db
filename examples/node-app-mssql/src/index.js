/**
 * Demonstrates use of sync-db to create functions, procedures and views in MSSQL.
 */
const knex = require('knex');
const connections = require('../connections.sync-db.json');

(async () => {
  try {
    // Getting configuration of database with id db1.
    const db1Connection = connections.find(({ id }) => id === 'db1');

    // Getting knex instance of the database.
    const db1Instance = knex({
      client: 'mssql',
      connection: db1Connection
    });

    const tables = await db1Instance.raw('SELECT * FROM utils.vw_table_names');
    const users = await db1Instance.raw('SELECT * FROM utils.vw_user_names');
    const [{ result: multiply }] = await db1Instance.raw('SELECT utils.calc_multiply(6, 7) AS result;');
    const [{ result: date }] = await db1Instance.raw('EXEC utils.get_date;');

    console.log('List of table names in the database.');
    tables.map(table => console.log(table.name));

    console.log('List of user names in the database.');
    users.map(user => console.log(user.name));

    console.log('Multiplication of two numbers.');
    console.log('6 X 7 = ' + multiply);

    console.log('Current date time.');
    console.log(date);

    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
})();
