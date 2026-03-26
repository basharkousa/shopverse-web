const { pool } = require('../../config/db');

async function getOverviewStats() {
  const [productsRes, ordersRes, salesRes, recentOrdersRes] = await Promise.all(
    [
      pool.query(`SELECT COUNT(*)::int AS count FROM products`),
      pool.query(`SELECT COUNT(*)::int AS count FROM orders`),
      pool.query(
        `SELECT COALESCE(SUM(total_cents), 0)::int AS total_sales_cents FROM orders`
      ),
      pool.query(
        `
      SELECT
        o.id,
        o.created_at,
        o.total_cents,
        o.status,
        u.full_name AS customer_name,
        u.email AS customer_email
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT 5
      `
      ),
    ]
  );

  return {
    totals: {
      products: productsRes.rows[0].count,
      orders: ordersRes.rows[0].count,
      sales_cents: salesRes.rows[0].total_sales_cents,
    },
    recent_orders: recentOrdersRes.rows.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      total_cents: row.total_cents,
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
    })),
  };
}

module.exports = {
  getOverviewStats,
};
