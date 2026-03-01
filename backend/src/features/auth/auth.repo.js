const { pool } = require('../../config/db');


/**
 * Find full user row by email (includes password_hash for login comparison).
 * Returns null if not found.
 */
async function findUserByEmail(email) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
    email,
  ]);
  return res.rows[0] || null;
}

/**
 * Find safe user by id (no password_hash).
 * Returns null if not found.
 */

async function findUserById(id) {
  const res = await pool.query(
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

/**
 * Create user and return safe user fields (no password_hash).
 */

async function createUser({ full_name, email, password_hash }) {
  const res = await pool.query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, role, created_at`,
    [full_name, email, password_hash]
  );

  return res.rows[0];
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};
