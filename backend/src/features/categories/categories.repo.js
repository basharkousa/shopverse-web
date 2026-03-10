const { pool } = require('../../config/db');

async function listCategories() {
  const res = await pool.query(
    `SELECT id, name, created_at
     FROM categories
     ORDER BY name ASC`
  );
  return res.rows;
}

module.exports = { listCategories };
