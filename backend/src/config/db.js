const { Pool } = require("pg");

console.log("DB_PASSWORD type:", typeof process.env.DB_PASSWORD);
console.log("DB_PASSWORD value exists:", !!process.env.DB_PASSWORD);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// optional: a small helper to test connection
async function testDbConnection() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT NOW() as now");
        return res.rows[0];
    } finally {
        client.release();
    }
}

module.exports = { pool, testDbConnection };