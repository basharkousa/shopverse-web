require('dotenv').config();
const { pool } = require('../../../config/db');
const { findUserByEmail } = require('../auth.repo');

(async () => {
  try {
    const u = await findUserByEmail('test@example.com');
    console.log('User:', u);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
