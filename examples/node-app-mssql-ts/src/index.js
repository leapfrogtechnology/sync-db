/**
 * Demonstrates use of sync-db to create functions, procedures and views in MSSQL.
 */
const knex = require('knex');
const { connections } = require('../connections.sync-db.json');

(async () => {
  try {
    // Getting knex instance of mssql database with id db1.
    const db = knex({
      client: 'mssql',
      connection: connections.find(({ id }) => id === 'db1').connection
    });

    const tasks = await db.raw('SELECT * FROM utils.vw_tasks');
    const users = await db.raw('SELECT * FROM utils.vw_users');
    const [{ result: product }] = await db.raw('SELECT utils.product(6, 7) AS result;');
    const [{ result: sum }] = await db.raw('SELECT dbo.sum(6, 7) AS result;');
    const [{ result: square }] = await db.raw('SELECT dbo.square(6) AS result;');
    const [{ result: date }] = await db.raw('EXEC utils.get_date;');

    console.log(
      '\nList of users:\n',
      users.map(({ email }) => email)
    );
    console.log(
      '\nList of completed tasks:\n',
      tasks.filter(task => !!task.is_complete)
    );
    console.log('\nCalculations:\n', {
      'Sum of 6 and 7': sum,
      'Square of 6': square,
      'Product of 6 and 7': product
    });
    console.log('\nCurrent date time:', date);

    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
})();
