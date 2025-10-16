// lsp-backend/modules/rekening/RekeningModel.js
const { query } = require("../../utils/db");

// NOTE: This model assumes a `rekening` table exists with columns:
// id (SERIAL), bank (VARCHAR), nomor (VARCHAR), atas_nama (VARCHAR), nama_lsp (VARCHAR)

async function findAll() {
  const res = await query("SELECT * FROM rekening ORDER BY bank");
  return res.rows;
}

async function create(data) {
  const { bank, nomor, atas_nama, nama_lsp } = data;
  const res = await query(
    "INSERT INTO rekening (bank, nomor, atas_nama, nama_lsp) VALUES ($1, $2, $3, $4) RETURNING *",
    [bank, nomor, atas_nama, nama_lsp]
  );
  return res.rows[0];
}

async function update(id, data) {
  const { bank, nomor, atas_nama, nama_lsp } = data;
  const res = await query(
    "UPDATE rekening SET bank = $1, nomor = $2, atas_nama = $3, nama_lsp = $4 WHERE id = $5 RETURNING *",
    [bank, nomor, atas_nama, nama_lsp, id]
  );
  return res.rows[0];
}

async function remove(id) {
  const res = await query("DELETE FROM rekening WHERE id = $1 RETURNING id", [
    id,
  ]);
  return res.rows[0];
}

module.exports = { findAll, create, update, remove };
