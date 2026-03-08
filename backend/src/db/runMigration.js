require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error(
      '❌ Provide migration filename, e.g. 002_add_rating_stock.sql'
    );
    process.exit(1);
  }

  const migrationPath = path.join(__dirname, 'migrations', file);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await pool.query(sql);
  console.log(`✅ Migration applied: ${file}`);
  await pool.end();
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
