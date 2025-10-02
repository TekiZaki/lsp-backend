// lsp-backend/modules/tuk/TempatUjiKompetensiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper");

// Custom mapping untuk input dari frontend/API ke DB
const mapTukInputToDb = (input) => {
  const dbData = {
    kode_tuk: input.kodeTuk,
    nama_tempat: input.namaTempat,
    jenis_tuk: input.jenisTuk,
    lsp_induk_id: input.lspIndukId, // Asumsi ID LSP, jika tidak ada, perlu ditambahkan lookup
    penanggung_jawab: input.penanggungJawab,
    lisensi_info: input.lisensi,
    skkni_info: input.skkni,
    jadwal_info: input.jadwal,
  };

  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );
  return dbData;
};

// Custom mapping untuk output dari DB ke API
const mapTukOutputToApi = (dbObject) => {
  if (!dbObject) return null;

  // Gunakan mapToCamelCase untuk semua kolom standar
  const camelCaseData = mapToCamelCase(dbObject);

  // Sesuaikan kembali nama field yang non-standar/custom
  return {
    id: camelCaseData.id,
    kodeTuk: camelCaseData.kodeTuk,
    namaTempat: camelCaseData.namaTempat,
    jenisTuk: camelCaseData.jenisTuk,
    penanggungJawab: camelCaseData.penanggungJawab,
    lisensi: camelCaseData.lisensiInfo, // Mapping lisensi_info -> lisensi
    skkni: camelCaseData.skkniInfo, // Mapping skkni_info -> skkni
    jadwal: camelCaseData.jadwalInfo, // Mapping jadwal_info -> jadwal
    lspIndukId: camelCaseData.lspIndukId,

    // Data yang diambil dari join (jika ada)
    lspInduk: camelCaseData.namaLsp,
    lspJenis: camelCaseData.jenisLsp,
  };
};

async function createTuk(tukData) {
  const dbData = mapTukInputToDb(tukData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO tempat_uji_kompetensi (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapTukOutputToApi(res.rows[0]);
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
  return res.rows.map(mapTukOutputToApi);
}

async function getTukById(id) {
  const res = await query(
    `SELECT t.*, l.nama_lsp, l.jenis_lsp
         FROM tempat_uji_kompetensi t
         LEFT JOIN lsp_institutions l ON t.lsp_induk_id = l.id
         WHERE t.id = $1`,
    [id]
  );
  return mapTukOutputToApi(res.rows[0]);
}

async function updateTuk(id, tukData) {
  const dbData = mapTukInputToDb(tukData);

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const key in dbData) {
    if (dbData.hasOwnProperty(key)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(dbData[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(id);

  const res = await query(
    `UPDATE tempat_uji_kompetensi SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  // Untuk mendapatkan lspInduk dan lspJenis, kita harus melakukan query ulang atau join
  // Untuk sederhana, kita akan update dan kemudian mengambil data lengkap (getTukById)
  if (res.rows[0]) {
    return getTukById(id);
  }
  return null;
}

async function deleteTuk(id) {
  const res = await query(
    "DELETE FROM tempat_uji_kompetensi WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

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
  getTukById,
  updateTuk,
  deleteTuk,
};
