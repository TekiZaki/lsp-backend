// lsp-backend/modules/euk/EventUjiKompetensiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper"); // Hanya butuh untuk output konversi

// Custom mapping untuk input dari frontend/API (camelCase non-standar) ke DB (snake_case)
const mapEukInputToDb = (input) => {
  // Asumsi: input menggunakan camelCase dari frontend
  const dbData = {
    event_name: input.namaKegiatan,
    start_date: input.tanggal,
    end_date: input.tanggal, // Asumsi tanggal selesai sama dengan tanggal mulai jika tidak diberikan
    registration_deadline: input.tanggal, // Asumsi deadline sama dengan tanggal mulai
    location: input.tempat,
    address: input.alamat, // Asumsi kolom 'address' ada di tabel events
    max_participants: input.jumlahPeserta,
    penanggung_jawab: input.penanggungJawab,
    lsp_penyelenggara: input.lspPenyelenggara,
    description: input.deskripsi,
    status: input.status,
    scheme_id: input.schemeId, // Diperlukan, asumsi dikirim
  };

  // Hapus key yang undefined
  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );

  return dbData;
};

// Custom mapping untuk output dari DB (snake_case) ke API (camelCase/non-standar)
const mapEukOutputToApi = (dbObject) => {
  if (!dbObject) return null;

  // Gunakan mapToCamelCase untuk semua kolom standar
  const camelCaseData = mapToCamelCase(dbObject);

  // Sesuaikan kembali nama field yang non-standar
  return {
    id: camelCaseData.id,
    namaKegiatan: camelCaseData.eventName,
    tanggal: camelCaseData.startDate,
    tempat: camelCaseData.location,
    alamat: camelCaseData.address,
    jumlahPeserta: camelCaseData.maxParticipants,
    penanggungJawab: camelCaseData.penanggungJawab,
    lspPenyelenggara: camelCaseData.lspPenyelenggara,
    deskripsi: camelCaseData.description,
    status: camelCaseData.status,
    schemeId: camelCaseData.schemeId,
    createdAt: camelCaseData.createdAt,
    updatedAt: camelCaseData.updatedAt,
  };
};

async function createEuk(eukData) {
  const dbData = mapEukInputToDb(eukData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO events (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapEukOutputToApi(res.rows[0]);
}

async function getAllEuks({ search, limit, offset }) {
  let queryText = `
    SELECT e.*, s.name AS scheme_name
    FROM events e
    LEFT JOIN certification_schemes s ON e.scheme_id = s.id
  `;
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(e.event_name) LIKE $1 OR LOWER(e.location) LIKE $1 OR LOWER(e.penanggung_jawab) LIKE $1)"
    );
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY e.start_date DESC";

  if (limit) {
    queryParams.push(limit);
    queryText += ` LIMIT $${queryParams.length}`;
  }
  if (offset) {
    queryParams.push(offset);
    queryText += ` OFFSET $${queryParams.length}`;
  }

  const res = await query(queryText, queryParams);

  // Map setiap baris hasil
  return res.rows.map((row) => {
    const apiOutput = mapEukOutputToApi(row);
    // Tambahkan nama skema jika ada
    apiOutput.schemeName = row.scheme_name;
    return apiOutput;
  });
}

async function getTotalEuks(search) {
  let queryText = "SELECT COUNT(*) FROM events";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(event_name) LIKE $1 OR LOWER(location) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

// Tambahkan implementasi untuk GET by ID
async function getEukById(id) {
  const res = await query("SELECT * FROM events WHERE id = $1", [id]);
  return mapEukOutputToApi(res.rows[0]);
}

// Tambahkan implementasi untuk UPDATE
async function updateEuk(id, eukData) {
  const dbData = mapEukInputToDb(eukData);

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
    return null; // Tidak ada data untuk diupdate
  }

  values.push(id); // ID adalah parameter terakhir

  const res = await query(
    `UPDATE events SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return mapEukOutputToApi(res.rows[0]);
}

// Tambahkan implementasi untuk DELETE
async function deleteEuk(id) {
  const res = await query("DELETE FROM events WHERE id = $1 RETURNING id", [
    id,
  ]);
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

module.exports = {
  createEuk,
  getAllEuks,
  getTotalEuks,
  getEukById,
  updateEuk,
  deleteEuk,
};
