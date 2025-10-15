// lsp-backend/modules/juk/JadwalUjiKompetensiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper");

/**
 * Catatan: Modul ini mengasumsikan tabel 'events' telah diperluas
 * dengan kolom 'tuk_id', 'asesor_id', dan 'nomor_surat_tugas'.
 */

// Custom mapping untuk input dari frontend/API ke DB (snake_case)
const mapJukInputToDb = (input) => {
  const dbData = {
    event_name: input.judulKegiatan,
    start_date: input.tanggalPelaksanaan,
    // Kita simpan jam pelaksanaan sebagai bagian dari deskripsi atau diabaikan,
    // karena kolom event_name sudah dipakai.
    // Atau bisa disimpan di location/description, tapi untuk query disederhanakan.
    max_participants: input.kuotaPeserta,
    scheme_id: input.schemeId, // ID Skema
    tuk_id: input.tukId, // ID TUK (Diasumsikan ada di tabel events)
    asesor_id: input.asesorId, // ID Asesor (Diasumsikan ada di tabel events)
    nomor_surat_tugas: input.nomorSuratTugas, // (Diasumsikan ada di tabel events)
    // Field lain dari form yang diabaikan dalam DB: tahun, periode, gelombang
  };

  // Kita gunakan kolom description untuk menyimpan jam pelaksanaan jika diperlukan
  if (input.jamPelaksanaan) {
    dbData.description = `Jam Pelaksanaan: ${input.jamPelaksanaan}`;
  }

  // Hapus key yang undefined
  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );

  return dbData;
};

// Custom mapping untuk output dari DB (snake_case) ke API (camelCase/non-standar)
const mapJukOutputToApi = (dbObject) => {
  if (!dbObject) return null;

  // Gunakan mapToCamelCase untuk konversi dasar
  const camelCaseData = mapToCamelCase(dbObject);

  // Sesuaikan kembali nama field API
  return {
    id: camelCaseData.id,
    judulKegiatan: camelCaseData.eventName,
    tanggalPelaksanaan: camelCaseData.startDate, // Atau bisa tambahkan logika pemformatan tanggal
    jamPelaksanaan: camelCaseData.description
      ? camelCaseData.description.replace("Jam Pelaksanaan: ", "")
      : "N/A",
    kuotaPeserta: camelCaseData.maxParticipants,
    schemeId: camelCaseData.schemeId,
    tukId: camelCaseData.tukId,
    asesorId: camelCaseData.asesorId,
    nomorSuratTugas: camelCaseData.nomorSuratTugas,

    // Data dari JOIN
    namaSkema: dbObject.scheme_name,
    kodeTuk: dbObject.kode_tuk,
    namaTuk: dbObject.nama_tempat,
    namaAsesor: dbObject.asesor_full_name,
    regAsesor: dbObject.reg_number,
  };
};

async function createJuk(jukData) {
  const dbData = mapJukInputToDb(jukData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO events (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapJukOutputToApi(res.rows[0]);
}

async function getAllJuks({ search, limit, offset }) {
  let queryText = `
    SELECT 
        e.*, 
        s.name AS scheme_name,
        t.kode_tuk, t.nama_tempat,
        ap.full_name AS asesor_full_name, ap.reg_number
    FROM events e
    LEFT JOIN certification_schemes s ON e.scheme_id = s.id
    LEFT JOIN tempat_uji_kompetensi t ON e.tuk_id = t.id
    LEFT JOIN asesor_profiles ap ON e.asesor_id = ap.user_id
  `;
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(e.event_name) LIKE $1 OR LOWER(s.name) LIKE $1 OR LOWER(t.nama_tempat) LIKE $1)"
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

  return res.rows.map(mapJukOutputToApi);
}

async function getTotalJuks(search) {
  let queryText = "SELECT COUNT(*) FROM events e";
  let queryParams = [];
  let conditions = [];

  if (search) {
    // Untuk penghitungan total, biasanya hanya perlu search di tabel utama
    conditions.push("(LOWER(event_name) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

async function getJukById(id) {
  const res = await query(
    `
    SELECT 
        e.*, 
        s.name AS scheme_name,
        t.kode_tuk, t.nama_tempat,
        ap.full_name AS asesor_full_name, ap.reg_number
    FROM events e
    LEFT JOIN certification_schemes s ON e.scheme_id = s.id
    LEFT JOIN tempat_uji_kompetensi t ON e.tuk_id = t.id
    LEFT JOIN asesor_profiles ap ON e.asesor_id = ap.user_id
    WHERE e.id = $1
    `,
    [id]
  );
  return mapJukOutputToApi(res.rows[0]);
}

async function updateJuk(id, jukData) {
  const dbData = mapJukInputToDb(jukData);

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
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id`,
    values
  );

  // Setelah update, ambil data lengkap dengan join
  if (res.rows[0]) {
    return getJukById(id);
  }
  return null;
}

async function deleteJuk(id) {
  const res = await query("DELETE FROM events WHERE id = $1 RETURNING id", [
    id,
  ]);
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

module.exports = {
  createJuk,
  getAllJuks,
  getTotalJuks,
  getJukById,
  updateJuk,
  deleteJuk,
};
