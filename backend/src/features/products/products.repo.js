const { pool } = require('../../config/db');

async function countProducts({ whereSql, params }) {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS count FROM products p ${whereSql}`,
    params
  );
  return res.rows[0].count;
}

function buildOrder(sort) {
  const s = String(sort || '').trim();
  if (s === 'topRated') {
    return 'ORDER BY p.rating DESC NULLS LAST, p.created_at DESC';
  }
  return 'ORDER BY p.created_at DESC';
}

async function listProducts({ whereSql, params, limit, offset, orderSql }) {
  const res = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.description,
        p.price_cents,
        p.image_url,
        p.image_urls,
        p.category_id,
        p.rating,
        p.stock_qty,
        p.created_at
      FROM products p
        ${whereSql}
        ${orderSql}
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
        p.image_urls,
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

async function listAdminProducts() {
  const res = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.description,
        p.price_cents,
        p.image_url,
        p.image_urls,
        p.category_id,
        c.name AS category_name,
        p.rating,
        p.stock_qty,
        p.created_at
      FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC, p.id DESC
    `
  );

  return res.rows;
}

async function getCategoryById(id) {
  const res = await pool.query(
    `
      SELECT id, name
      FROM categories
      WHERE id = $1
        LIMIT 1
    `,
    [id]
  );

  return res.rows[0] || null;
}

async function createProduct({
  title,
  description,
  priceCents,
  imageUrl,
  imageUrls,
  categoryId,
  rating,
  stockQty,
}) {
  const res = await pool.query(
    `
      INSERT INTO products (
        title,
        description,
        price_cents,
        image_url,
        image_urls,
        category_id,
        rating,
        stock_qty
      )
      VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8)
        RETURNING id
    `,
    [
      title,
      description,
      priceCents,
      imageUrl,
      imageUrls,
      categoryId,
      rating,
      stockQty,
    ]
  );

  return getProductById(res.rows[0].id);
}

async function updateProductById(
  id,
  {
    title,
    description,
    priceCents,
    imageUrl,
    imageUrls,
    categoryId,
    rating,
    stockQty,
  }
) {
  const res = await pool.query(
    `
      UPDATE products
      SET
        title = $2,
        description = $3,
        price_cents = $4,
        image_url = $5,
        image_urls = $6::text[],
      category_id = $7,
        rating = $8,
        stock_qty = $9
      WHERE id = $1
        RETURNING id
    `,
    [
      id,
      title,
      description,
      priceCents,
      imageUrl,
      imageUrls,
      categoryId,
      rating,
      stockQty,
    ]
  );

  if (!res.rows[0]) return null;
  return getProductById(res.rows[0].id);
}

async function deleteProductById(id) {
  const res = await pool.query(
    `
      DELETE FROM products
      WHERE id = $1
        RETURNING id
    `,
    [id]
  );

  return res.rows[0] || null;
}

module.exports = {
  countProducts,
  buildOrder,
  listProducts,
  getProductById,
  listAdminProducts,
  getCategoryById,
  createProduct,
  updateProductById,
  deleteProductById,
};
