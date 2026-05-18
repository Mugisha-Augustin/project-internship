const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'pocket_db',
  user: 'postgres',
  password: 'postgres',
});

module.exports = pool;
