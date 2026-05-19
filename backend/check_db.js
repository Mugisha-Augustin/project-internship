const pool = require('./db');
async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'expenses';
    `);
    console.log('Columns:', res.rows);
    const countRes = await pool.query('SELECT COUNT(*) FROM expenses;');
    console.log('Total rows:', countRes.rows[0]);
    const sampleRes = await pool.query('SELECT * FROM expenses LIMIT 5;');
    console.log('Sample rows:', sampleRes.rows);
  } catch (err) {
    console.error('Error querying DB:', err.message);
  } finally {
    await pool.end();
  }
}
check();
