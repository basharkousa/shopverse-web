const { pool } = require('../../config/db');

async function getProductsForOrder(productIds, client = pool) {
  const res = await client.query(
    `
    SELECT id, title, price_cents, stock_qty
    FROM products
    WHERE id = ANY($1::int[])
    `,
    [productIds]
  );

  return res.rows;
}

async function insertOrder(
  { userId, status = 'pending', totalCents },
  client = pool
) {
  const res = await client.query(
    `
    INSERT INTO orders (user_id, status, total_cents)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, status, total_cents, created_at
    `,
    [userId, status, totalCents]
  );

  return res.rows[0];
}

async function insertOrderItem(
  { orderId, productId, quantity, unitPriceCents },
  client = pool
) {
  const res = await client.query(
    `
    INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
    VALUES ($1, $2, $3, $4)
    RETURNING id, order_id, product_id, quantity, unit_price_cents
    `,
    [orderId, productId, quantity, unitPriceCents]
  );

  return res.rows[0];
}



async function getOrdersByUserId(userId, client = pool) {
  const res = await client.query(
    `
    SELECT
      id,
      created_at,
      total_cents,
      status
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC, id DESC
    `,
    [userId]
  );

  return res.rows;
}

module.exports = {
  getProductsForOrder,
  insertOrder,
  insertOrderItem,
  getOrdersByUserId,
};
