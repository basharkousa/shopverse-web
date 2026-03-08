require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function run() {
  const seedPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  await pool.query(sql);
  console.log('✅ Seed applied successfully');
  await pool.end();
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
