// lsp-backend/modules/biaya/BiayaModel.js
const { query } = require("../../utils/db");

// NOTE: This model assumes a `biaya` table exists with columns:
// id (SERIAL), scheme_id (INT), jenis_biaya (VARCHAR), nominal (INT), standar (VARCHAR, optional)
// A JOIN with `certification_schemes` is used to get skema name.

async function findAll() {
  const res = await query(`
    SELECT 
      b.id,
      cs.name as skema,
      b.standar,
      b.jenis_biaya,
      b.nominal
    FROM biaya b
    LEFT JOIN certification_schemes cs ON b.scheme_id = cs.id
    ORDER BY cs.name, b.jenis_biaya
  `);
  return res.rows;
}

async function findById(id) {
  const res = await query("SELECT * FROM biaya WHERE id = $1", [id]);
  return res.rows[0];
}

async function create(data) {
  const { scheme_id, jenis_biaya, nominal, standar } = data;
  const res = await query(
    "INSERT INTO biaya (scheme_id, jenis_biaya, nominal, standar) VALUES ($1, $2, $3, $4) RETURNING *",
    [scheme_id, jenis_biaya, nominal, standar]
  );
  return res.rows[0];
}

async function update(id, data) {
  const { scheme_id, jenis_biaya, nominal, standar } = data;
  const res = await query(
    "UPDATE biaya SET scheme_id = $1, jenis_biaya = $2, nominal = $3, standar = $4 WHERE id = $5 RETURNING *",
    [scheme_id, jenis_biaya, nominal, standar, id]
  );
  return res.rows[0];
}

async function remove(id) {
  const res = await query("DELETE FROM biaya WHERE id = $1 RETURNING id", [id]);
  return res.rows[0];
}

module.exports = { findAll, findById, create, update, remove };
