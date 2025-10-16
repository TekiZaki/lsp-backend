// lsp-backend/modules/verifikasi/VerifikasiModel.js
const { query } = require("../../utils/db");

// NOTE: This model fetches data from multiple tables. It assumes the existence of:
// `persyaratan_skema`: id, scheme_id, deskripsi
// `dokumen_asesi`: id, asesi_id, nama, no_dokumen, tanggal, file_url
// `jadwal_asesmen`: id, scheme_id, nama, deskripsi
// `biaya`: Used for cost requirements.
// It also joins `asesi_profiles` and `certification_schemes`.

async function findAsesiForVerification(asesiId) {
  const res = await query(
    `SELECT 
      ap.id, ap.full_name, ap.registration_number, ap.education, ap.scheme_id,
      cs.code AS scheme_code, cs.name AS scheme_name
     FROM asesi_profiles ap
     JOIN certification_schemes cs ON ap.scheme_id = cs.id
     WHERE ap.id = $1`,
    [asesiId]
  );
  return res.rows[0];
}

async function findSchemeRequirements(schemeId) {
  const res = await query(
    "SELECT id, deskripsi FROM persyaratan_skema WHERE scheme_id = $1 ORDER BY id",
    [schemeId]
  );
  return res.rows;
}

async function findSchemeCosts(schemeId) {
  const res = await query(
    "SELECT jenis_biaya AS jenis, nominal FROM biaya WHERE scheme_id = $1 ORDER BY jenis_biaya",
    [schemeId]
  );
  // Format nominal to match frontend example "Rp. 200.000"
  return res.rows.map((row) => ({
    ...row,
    nominal: `Rp. ${parseInt(row.nominal, 10).toLocaleString("id-ID")}`,
  }));
}

async function findAsesiDocuments(asesiId) {
  const res = await query(
    "SELECT id, nama, no_dokumen, tanggal, status, file_url FROM dokumen_asesi WHERE asesi_id = $1 ORDER BY id",
    [asesiId]
  );
  return res.rows;
}

async function findAvailableSchedules(schemeId) {
  const res = await query(
    "SELECT id, nama, deskripsi FROM jadwal_asesmen WHERE scheme_id = $1 AND status = 'tersedia' ORDER BY id",
    [schemeId]
  );
  return res.rows;
}

async function findUnitKompetensiByScheme(schemeId) {
  const res = await query(
    `SELECT 
        uk.id,
        uk.kode_unit AS kode,
        uk.nama_unit AS judul,
        cs.code AS skema_kode,
        cs.name AS skema_nama,
        cs.skkni AS standar, -- Assuming skkni is the 'standar' field
        uk.jenis_standar AS standar_tipe,
        (SELECT COUNT(*) FROM elemen_kompetensi ek WHERE ek.unit_id = uk.id) AS elemen_count,
        (SELECT COUNT(*) FROM kriteria_unjuk_kerja kuk JOIN elemen_kompetensi ek ON kuk.elemen_id = ek.id WHERE ek.unit_id = uk.id) AS kriteria_count
     FROM unit_kompetensi uk
     JOIN certification_schemes cs ON uk.scheme_id = cs.id
     WHERE uk.scheme_id = $1
     ORDER BY uk.kode_unit`,
    [schemeId]
  );
  return res.rows;
}

module.exports = {
  findAsesiForVerification,
  findSchemeRequirements,
  findSchemeCosts,
  findAsesiDocuments,
  findAvailableSchedules,
  findUnitKompetensiByScheme,
};
