// models/lspModel.js
const { query } = require("../utils/db");

async function createLsp(lspData) {
  const {
    kode_lsp,
    nama_lsp,
    jenis_lsp,
    direktur_lsp,
    manajer_lsp,
    institusi_induk,
    skkni,
    telepon,
    faximile,
    whatsapp,
    alamat_email,
    website,
    alamat,
    desa,
    kecamatan,
    kota,
    provinsi,
    kode_pos,
    nomor_lisensi,
    masa_berlaku,
  } = lspData;

  const res = await query(
    `INSERT INTO lsp_institutions (
            kode_lsp, nama_lsp, jenis_lsp, direktur_lsp, manajer_lsp, institusi_induk, skkni,
            telepon, faximile, whatsapp, alamat_email, website,
            alamat, desa, kecamatan, kota, provinsi, kode_pos,
            nomor_lisensi, masa_berlaku
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *`,
    [
      kode_lsp,
      nama_lsp,
      jenis_lsp,
      direktur_lsp,
      manajer_lsp,
      institusi_induk,
      skkni,
      telepon,
      faximile,
      whatsapp,
      alamat_email,
      website,
      alamat,
      desa,
      kecamatan,
      kota,
      provinsi,
      kode_pos,
      nomor_lisensi,
      masa_berlaku,
    ]
  );
  return res.rows[0];
}

async function getAllLsps({ search, limit, offset }) {
  let queryText = "SELECT * FROM lsp_institutions";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(nama_lsp) LIKE $1 OR LOWER(direktur_lsp) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY created_at DESC";

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

async function getLspById(id) {
  const res = await query("SELECT * FROM lsp_institutions WHERE id = $1", [id]);
  return res.rows[0];
}

async function updateLsp(id, lspData) {
  const {
    kode_lsp,
    nama_lsp,
    jenis_lsp,
    direktur_lsp,
    manajer_lsp,
    institusi_induk,
    skkni,
    telepon,
    faximile,
    whatsapp,
    alamat_email,
    website,
    alamat,
    desa,
    kecamatan,
    kota,
    provinsi,
    kode_pos,
    nomor_lisensi,
    masa_berlaku,
  } = lspData;

  const res = await query(
    `UPDATE lsp_institutions SET
            kode_lsp = $1, nama_lsp = $2, jenis_lsp = $3, direktur_lsp = $4, manajer_lsp = $5, institusi_induk = $6, skkni = $7,
            telepon = $8, faximile = $9, whatsapp = $10, alamat_email = $11, website = $12,
            alamat = $13, desa = $14, kecamatan = $15, kota = $16, provinsi = $17, kode_pos = $18,
            nomor_lisensi = $19, masa_berlaku = $20, updated_at = CURRENT_TIMESTAMP
        WHERE id = $21
        RETURNING *`,
    [
      kode_lsp,
      nama_lsp,
      jenis_lsp,
      direktur_lsp,
      manajer_lsp,
      institusi_induk,
      skkni,
      telepon,
      faximile,
      whatsapp,
      alamat_email,
      website,
      alamat,
      desa,
      kecamatan,
      kota,
      provinsi,
      kode_pos,
      nomor_lisensi,
      masa_berlaku,
      id,
    ]
  );
  return res.rows[0];
}

async function deleteLsp(id) {
  const res = await query(
    "DELETE FROM lsp_institutions WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0];
}

// Tambahkan fungsi untuk menghitung total data LSP (untuk paginasi frontend)
async function getTotalLsps(search) {
  let queryText = "SELECT COUNT(*) FROM lsp_institutions";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(nama_lsp) LIKE $1 OR LOWER(direktur_lsp) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

module.exports = {
  createLsp,
  getAllLsps,
  getLspById,
  updateLsp,
  deleteLsp,
  getTotalLsps,
};
