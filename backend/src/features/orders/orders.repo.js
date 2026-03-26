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
  {
    userId,
    status = 'pending',
    totalCents,
    shippingName,
    shippingCity,
    shippingAddress,
    shippingPhone,
  },
  client = pool
) {
  const res = await client.query(
    `
      INSERT INTO orders (
        user_id,
        status,
        total_cents,
        shipping_name,
        shipping_city,
        shipping_address,
        shipping_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
      id,
      user_id,
      status,
      total_cents,
      shipping_name,
      shipping_city,
      shipping_address,
      shipping_phone,
      created_at
    `,
    [
      userId,
      status,
      totalCents,
      shippingName,
      shippingCity,
      shippingAddress,
      shippingPhone,
    ]
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
        status,
        shipping_name,
        shipping_city,
        shipping_address,
        shipping_phone
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC
    `,
    [userId]
  );

  return res.rows;
}

async function getAdminOrders(client = pool) {
  const res = await client.query(
    `
    SELECT
      o.id,
      o.created_at,
      o.total_cents,
      o.status,
      u.id AS user_id,
      u.full_name AS customer_name,
      u.email AS customer_email
    FROM orders o
    INNER JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC, o.id DESC
    `
  );

  return res.rows;
}

async function getAdminOrderHeaderById(orderId, client = pool) {
  const res = await client.query(
    `
    SELECT
      o.id,
      o.created_at,
      o.total_cents,
      o.status,
      o.shipping_name,
      o.shipping_city,
      o.shipping_address,
      o.shipping_phone,
      u.id AS user_id,
      u.full_name AS customer_name,
      u.email AS customer_email
    FROM orders o
    INNER JOIN users u ON u.id = o.user_id
    WHERE o.id = $1
    LIMIT 1
    `,
    [orderId]
  );

  return res.rows[0] || null;
}

async function getOrderItemsByOrderId(orderId, client = pool) {
  const res = await client.query(
    `
    SELECT
      oi.id,
      oi.order_id,
      oi.product_id,
      oi.quantity,
      oi.unit_price_cents,
      p.title AS product_title,
      p.image_url AS product_image_url
    FROM order_items oi
    INNER JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
    ORDER BY oi.id ASC
    `,
    [orderId]
  );

  return res.rows;
}

async function updateOrderStatusById(orderId, status, client = pool) {
  const res = await client.query(
    `
    UPDATE orders
    SET status = $2
    WHERE id = $1
    RETURNING
      id,
      user_id,
      status,
      total_cents,
      shipping_name,
      shipping_city,
      shipping_address,
      shipping_phone,
      created_at
    `,
    [orderId, status]
  );

  return res.rows[0] || null;
}

module.exports = {
  getProductsForOrder,
  insertOrder,
  insertOrderItem,
  getOrdersByUserId,
  getAdminOrders,
  getAdminOrderHeaderById,
  getOrderItemsByOrderId,
  updateOrderStatusById,
};
