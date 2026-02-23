require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

async function run() {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");

    await pool.query(sql);
    console.log("✅ Schema applied successfully");
    await pool.end();
}

run().catch((err) => {
    console.error("❌ Failed to apply schema:", err);
    process.exit(1);
});