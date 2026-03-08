const { pool } = require('../../config/db');

async function countProducts({ whereSql, params }) {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS count FROM products p ${whereSql}`,
    params
  );
  return res.rows[0].count;
}

async function listProducts({ whereSql, params, limit, offset }) {
  const res = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.description,
      p.price_cents,
      p.image_url,
      p.category_id,
      p.created_at
    FROM products p
    ${whereSql}
    ORDER BY p.created_at DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `,
    [...params, limit, offset]
  );

  return res.rows;
}

async function getProductById(id) {
  const res = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.description,
      p.price_cents,
      p.image_url,
      p.category_id,
      p.rating,
      p.stock_qty,
      p.created_at,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = $1
    LIMIT 1
    `,
    [id]
  );

  return res.rows[0] || null;
}

module.exports = { countProducts, listProducts, getProductById };
