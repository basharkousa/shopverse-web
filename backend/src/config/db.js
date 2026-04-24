const { Pool } = require('pg');

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '')
    return defaultValue;
  return String(value).toLowerCase() === 'true';
}

const isProduction = process.env.NODE_ENV === 'production';
const useSsl = toBoolean(process.env.DB_SSL, isProduction);

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

// optional: a small helper to test connection
async function testDbConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW() as now');
    return res.rows[0];
  } finally {
    client.release();
  }
}

module.exports = { pool, testDbConnection };
