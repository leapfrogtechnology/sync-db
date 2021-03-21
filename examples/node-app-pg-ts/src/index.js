/**
 * Demonstrates use of sync-db to create functions, procedures and views in PostgresSql.
 */
const dbConfig = require('../knexfile').connection.connection;

(async () => {
  try {
    // PostgreSQL connection only works with a connection string.
    // Time wasted = 60 minutes
    const db = require('knex')({
      client: 'pg',
      connection: `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    });

    const { rows: tables } = await db.raw('SELECT * FROM utils.vw_table_names');
    const { rows: users } = await db.raw('SELECT * FROM utils.vw_user_names');

    const { rows: [{ result: sum }] } = await db.raw('SELECT public.sum(6, 7) AS result;');
    const { rows: [{ result: square }]} = await db.raw('SELECT public.square(6) AS result;');

    const { rows: [{ result: product }]} = await db.raw('SELECT utils.product(6, 7) AS result;');
    const { rows: [{ result: date }]} = await db.raw('SELECT utils.get_date() AS result;');

    console.log(
      '\nList of table names in the database:\n',
      tables.map(({ name }) => name)
    );
    console.log(
      '\nList of user names in the database:\n',
      users.map(({ name }) => name)
    );
    console.log('\nCalculations:\n', {
      'Sum of 6 and 7': sum,
      'Square of 6': square,
      'Product of 6 and 7': product
    });
    console.log('\nCurrent date time:', date);

    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
})();
