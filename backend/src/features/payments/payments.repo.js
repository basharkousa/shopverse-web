const { pool } = require('../../config/db');

async function getOrderByIdForPayment(orderId, client = pool) {
  const res = await client.query(
    `
    SELECT
      id,
      user_id,
      status,
      total_cents,
      shipping_name,
      shipping_city,
      shipping_address,
      shipping_phone,
      created_at
    FROM orders
    WHERE id = $1
    LIMIT 1
    `,
    [orderId]
  );

  return res.rows[0] || null;
}

module.exports = {
  getOrderByIdForPayment,
};
