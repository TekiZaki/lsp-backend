// config/database.js
require("dotenv").config();
const { Pool } = require("pg");

// Pastikan DATABASE_URL di .env Anda diisi dengan Connection String dari Supabase
// Format: postgres://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl diperlukan untuk koneksi ke Supabase
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
