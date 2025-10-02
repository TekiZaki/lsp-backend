// lsp-backend/models/globalModel.js
const { query } = require("../utils/db");

// Fungsi umum untuk mendapatkan Role
async function getRoleByName(name) {
  const res = await query("SELECT id, name FROM roles WHERE name = $1", [name]);
  return res.rows[0];
}

async function getRoleById(id) {
  const res = await query("SELECT id, name FROM roles WHERE id = $1", [id]);
  return res.rows[0];
}

module.exports = {
  getRoleByName,
  getRoleById,
};
