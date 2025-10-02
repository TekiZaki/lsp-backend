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

// Tambahkan fungsi untuk mendapatkan client pool secara langsung (untuk transaksi)
async function getClient() {
  return pool.connect();
}

module.exports = {
  query,
  pool,
  getClient, // Export fungsi baru
};
