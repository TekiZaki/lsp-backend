// models/tukModel.js
const { query } = require("../utils/db");

async function createTuk(tukData) {
  const {
    kode_tuk,
    nama_tempat,
    jenis_tuk,
    lsp_induk_id, // Asumsi ini referensi ke lsp_institutions(id)
    penanggung_jawab,
    lisensi_info,
    skkni_info,
    jadwal_info,
  } = tukData;

  const res = await query(
    `INSERT INTO tempat_uji_kompetensi (
        kode_tuk, nama_tempat, jenis_tuk, lsp_induk_id, penanggung_jawab, lisensi_info, skkni_info, jadwal_info
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      kode_tuk,
      nama_tempat,
      jenis_tuk,
      lsp_induk_id,
      penanggung_jawab,
      lisensi_info,
      skkni_info,
      jadwal_info,
    ]
  );
  return res.rows[0];
}

async function getAllTuks({ search, limit, offset }) {
  let queryText = `
    SELECT t.*, l.nama_lsp, l.jenis_lsp
    FROM tempat_uji_kompetensi t
    LEFT JOIN lsp_institutions l ON t.lsp_induk_id = l.id
  `;
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(t.nama_tempat) LIKE $1 OR LOWER(t.kode_tuk) LIKE $1 OR LOWER(t.penanggung_jawab) LIKE $1 OR LOWER(l.nama_lsp) LIKE $1)"
    );
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY t.created_at DESC";

  if (limit) {
    queryParams.push(limit);
    queryText += ` LIMIT $${queryParams.length}`;
  }
  if (offset) {
    queryParams.push(offset);
    queryText += ` OFFSET $${queryParams.length}`;
  }

  const res = await query(queryText, queryParams);
  return res.rows;
}

// Tambahkan fungsi untuk getById, update, delete dan getTotal (mirip lspModel)
// ... (omitted for brevity, follow lspModel structure)
async function getTotalTuks(search) {
  let queryText = "SELECT COUNT(*) FROM tempat_uji_kompetensi";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(nama_tempat) LIKE $1 OR LOWER(kode_tuk) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

module.exports = {
  createTuk,
  getAllTuks,
  getTotalTuks,
  // ... (export other functions)
};
