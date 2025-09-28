// utils/db.js
const pool = require("../config/database");

async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  pool, // Ekspor pool juga jika dibutuhkan langsung di tempat lain (misalnya untuk transaksi)
};
