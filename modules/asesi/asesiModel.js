// lsp-backend/modules/asesi/asesiModel.js
const { query } = require("../../utils/db");
const bcrypt = require("bcryptjs"); // Untuk hashing password
const { mapToCamelCase, mapToSnakeCase } = require("../../utils/dataMapper");

// ===============================================
// AUTH & USER RELATED (diperlukan untuk manajemen asesi)
// ===============================================
async function findUserByUsername(username) {
  const res = await query(
    "SELECT id, username, password, email, role_id FROM users WHERE username = $1",
    [username]
  );
  return res.rows[0];
}

async function findAsesiProfileByUserId(userId) {
  const res = await query("SELECT * FROM asesi_profiles WHERE user_id = $1", [
    userId,
  ]);
  return res.rows[0];
}

async function createUserForAsesi(
  client,
  username,
  plainPassword,
  email,
  role_id
) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const res = await client.query(
    "INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id",
    [username, hashedPassword, email, role_id]
  );
  return res.rows[0];
}

async function deleteUser(client, userId) {
  const res = await client.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [userId]
  );
  return res.rows[0];
}

// ===============================================
// SCHEME RELATED (untuk mendapatkan nama skema)
// ===============================================
async function getCertificationSchemeById(schemeId) {
  const res = await query(
    "SELECT id, name, code FROM certification_schemes WHERE id = $1",
    [schemeId]
  );
  return res.rows[0];
}

async function getCertificationSchemeByCode(schemeCode) {
  const res = await query(
    "SELECT id, name, code FROM certification_schemes WHERE code = $1",
    [schemeCode]
  );
  return res.rows[0];
}

// ===============================================
// ASESI PROFILES (Specific CRUD for Asesi)
// ===============================================

async function findAllAsesi(statusFilter, isBlockedFilter, searchTerm) {
  let queryText = `
        SELECT
            ap.id, ap.user_id, ap.full_name, ap.phone_number, ap.address, ap.ktp_number,
            ap.registration_number, ap.education, ap.status, ap.is_blocked,
            ap.scheme_id, ap.assessment_date, ap.plotting_asesor, ap.documents_status,
            ap.certificate_status, ap.photo_url,
            cs.name AS scheme_name, cs.code AS scheme_code,
            u.username, u.email
        FROM asesi_profiles ap
        JOIN users u ON ap.user_id = u.id
        LEFT JOIN certification_schemes cs ON ap.scheme_id = cs.id
        WHERE 1=1
    `;
  const queryParams = [];
  let paramIndex = 1;

  if (statusFilter) {
    queryText += ` AND ap.status = $${paramIndex++}`;
    queryParams.push(statusFilter);
  }
  if (isBlockedFilter !== undefined && isBlockedFilter !== null) {
    queryText += ` AND ap.is_blocked = $${paramIndex++}`;
    queryParams.push(isBlockedFilter);
  }
  if (searchTerm) {
    queryText += ` AND (
            ap.full_name ILIKE $${paramIndex} OR
            ap.registration_number ILIKE $${paramIndex} OR
            u.username ILIKE $${paramIndex} OR
            u.email ILIKE $${paramIndex} OR
            cs.name ILIKE $${paramIndex}
        )`;
    queryParams.push(`%${searchTerm}%`);
    paramIndex++;
  }

  queryText += ` ORDER BY ap.created_at DESC`;

  const res = await query(queryText, queryParams);
  return res.rows;
}

async function findAsesiById(id) {
  const res = await query(
    `
        SELECT
            ap.id, ap.user_id, ap.full_name, ap.phone_number, ap.address, ap.ktp_number,
            ap.registration_number, ap.education, ap.status, ap.is_blocked,
            ap.scheme_id, ap.assessment_date, ap.plotting_asesor, ap.documents_status,
            ap.certificate_status, ap.photo_url,
            cs.name AS scheme_name, cs.code AS scheme_code,
            u.username, u.email
        FROM asesi_profiles ap
        JOIN users u ON ap.user_id = u.id
        LEFT JOIN certification_schemes cs ON ap.scheme_id = cs.id
        WHERE ap.id = $1
    `,
    [id]
  );
  return res.rows[0];
}

async function createAsesiProfileWithUserId(client, userId, profileData) {
  const {
    full_name,
    phone_number,
    address,
    ktp_number,
    registration_number,
    education,
    status,
    is_blocked,
    scheme_id,
    assessment_date,
    plotting_asesor,
    documents_status,
    certificate_status,
    photo_url,
  } = profileData;

  const res = await client.query(
    `INSERT INTO asesi_profiles (
            user_id, full_name, phone_number, address, ktp_number, registration_number,
            education, status, is_blocked, scheme_id, assessment_date, plotting_asesor,
            documents_status, certificate_status, photo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
    [
      userId,
      full_name,
      phone_number,
      address,
      ktp_number,
      registration_number,
      education,
      status || "belum terverifikasi", // Default status
      is_blocked || false, // Default block status
      scheme_id,
      assessment_date,
      plotting_asesor,
      documents_status || "Belum Lengkap",
      certificate_status || "Belum Dicetak",
      photo_url,
    ]
  );
  return res.rows[0];
}

async function updateAsesi(id, updateData) {
  const mappedData = mapToSnakeCase(updateData);
  const keys = Object.keys(mappedData);
  const values = Object.values(mappedData);

  if (keys.length === 0) return null;

  const setClauses = keys
    .map((key, index) => `${key} = $${index + 2}`)
    .join(", ");
  const res = await query(
    `UPDATE asesi_profiles SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return res.rows[0];
}

async function deleteAsesi(client, id) {
  const res = await client.query(
    "DELETE FROM asesi_profiles WHERE id = $1 RETURNING id, user_id",
    [id]
  );
  return res.rows[0];
}

// ===============================================
// GEOGRAPHICAL DATA (For Public Display)
// ===============================================

// Contoh simulasi untuk mendapatkan data provinsi dan kota
// Di aplikasi nyata, ini akan melibatkan tabel `provinsi` dan `kota`
// yang mungkin tidak ada dalam SQL dump awal.
// Untuk tujuan ini, kita akan membuat query yang mencoba mengidentifikasi provinsi/kota
// dari kolom `address` atau membuat tabel dummy jika diperlukan.

async function getProvincesWithAsesiCount() {
  // Ini adalah placeholder. Implementasi nyata akan memerlukan tabel `provinsi` dan `kota`
  // dan join yang kompleks. Untuk simulasi, kita bisa mengelompokkan dari `address` atau data dummy.
  const res = await query(
    `
    SELECT
        UPPER(SUBSTRING(ap.address FROM '(?<=Provinsi: )[^,]+')) AS province_name,
        COUNT(ap.id) AS total_asesi
    FROM asesi_profiles ap
    WHERE ap.address IS NOT NULL
    GROUP BY province_name
    HAVING UPPER(SUBSTRING(ap.address FROM '(?<=Provinsi: )[^,]+')) IS NOT NULL
    ORDER BY total_asesi DESC;
    `
  );
  // Format hasil agar mirip dengan data dummy: { id: ..., wilayah: ..., jumlah: ... }
  // ID akan disimulasikan sebagai index + 1
  return res.rows.map((row, index) => ({
    id: index + 1,
    wilayah: row.province_name,
    jumlah: parseInt(row.total_asesi, 10),
  }));
}

async function getCitiesByProvinceId(provinsiId) {
  // Lagi, ini placeholder. Ketergantungan pada struktur `address`
  const provinces = await getProvincesWithAsesiCount();
  const selectedProvince = provinces.find((p) => p.id === parseInt(provinsiId));

  if (!selectedProvince) return [];

  const res = await query(
    `
    SELECT
        UPPER(SUBSTRING(ap.address FROM '(?<=Kota/Kabupaten: )[^,]+')) AS city_name,
        COUNT(ap.id) AS total_asesi
    FROM asesi_profiles ap
    WHERE ap.address ILIKE $1
    AND UPPER(SUBSTRING(ap.address FROM '(?<=Kota/Kabupaten: )[^,]+')) IS NOT NULL
    GROUP BY city_name
    HAVING UPPER(SUBSTRING(ap.address FROM '(?<=Kota/Kabupaten: )[^,]+')) IS NOT NULL
    ORDER BY total_asesi DESC;
    `,
    [`%Provinsi: ${selectedProvince.wilayah}%`]
  );

  return res.rows.map((row, index) => ({
    id: index + 1,
    provinsiId: parseInt(provinsiId),
    wilayah: row.city_name,
    jumlah: parseInt(row.total_asesi, 10),
  }));
}

async function getAsesiByCityId(kotaId) {
  // Ini sangat bergantung pada data simulasi atau skema `address` yang sangat spesifik
  // Untuk tujuan demo, kita akan mengasumsikan kotaId merujuk ke data dummy yang sesuai.
  // Untuk backend, kita perlu query yang lebih solid.

  // Contoh: Ambil nama kota dari ID dummy
  const dummyCities = await getCitiesByProvinceId(1); // Contoh: Ambil dari provinsi ID 1
  const selectedCity = dummyCities.find((c) => c.id === parseInt(kotaId));

  if (!selectedCity) return [];

  const res = await query(
    `
    SELECT
        ap.id, ap.full_name AS nama, ap.phone_number AS no_hp
    FROM asesi_profiles ap
    WHERE ap.address ILIKE $1
    ORDER BY ap.full_name ASC;
    `,
    [`%Kota/Kabupaten: ${selectedCity.wilayah}%`]
  );

  return res.rows;
}

module.exports = {
  findUserByUsername,
  findAsesiProfileByUserId,
  createUserForAsesi,
  deleteUser,
  getCertificationSchemeById,
  getCertificationSchemeByCode, // Export baru
  findAllAsesi,
  findAsesiById,
  createAsesiProfileWithUserId,
  updateAsesi,
  deleteAsesi,
  getProvincesWithAsesiCount,
  getCitiesByProvinceId,
  getAsesiByCityId,
};
