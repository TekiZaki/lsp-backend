// lsp-backend/modules/scheme/SkemaSertifikasiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper");

// Custom mapping untuk input dari frontend/API ke DB
const mapSchemeInputToDb = (input) => {
  const dbData = {
    code: input.kodeSkema,
    name: input.namaSkema,
    description: input.description, // Asumsi description opsional
    skkni: input.skkni,
    keterangan_bukti: input.keteranganBukti,
    is_active: input.isActive,
  };

  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );
  return dbData;
};

// Custom mapping untuk output dari DB ke API
const mapSchemeOutputToApi = (dbObject) => {
  if (!dbObject) return null;

  // Gunakan mapToCamelCase untuk konversi dasar
  const camelCaseData = mapToCamelCase(dbObject);

  // Sesuaikan kembali nama field API
  return {
    id: camelCaseData.id,
    kodeSkema: camelCaseData.code,
    namaSkema: camelCaseData.name,
    skkni: camelCaseData.skkni,
    keteranganBukti: camelCaseData.keteranganBukti,
    isActive: camelCaseData.isActive,
    // Properti yang didapatkan dari join atau agregasi
    persyaratanCount: camelCaseData.persyaratanCount || 0,
  };
};

async function createScheme(schemeData) {
  const dbData = mapSchemeInputToDb(schemeData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO certification_schemes (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapSchemeOutputToApi(res.rows[0]);
}

async function getAllSchemes({ search, limit, offset }) {
  // Query ini disederhanakan, di dunia nyata mungkin perlu JOIN untuk mendapatkan persyaratanCount
  let queryText = "SELECT * FROM certification_schemes";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(name) LIKE $1 OR LOWER(code) LIKE $1 OR LOWER(skkni) LIKE $1)"
    );
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
  return res.rows.map(mapSchemeOutputToApi);
}

async function getTotalSchemes(search) {
  let queryText = "SELECT COUNT(*) FROM certification_schemes";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(name) LIKE $1 OR LOWER(code) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

async function getSchemeById(id) {
  const res = await query("SELECT * FROM certification_schemes WHERE id = $1", [
    id,
  ]);
  return mapSchemeOutputToApi(res.rows[0]);
}

async function updateScheme(id, schemeData) {
  const dbData = mapSchemeInputToDb(schemeData);

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
    `UPDATE certification_schemes SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return mapSchemeOutputToApi(res.rows[0]);
}

async function deleteScheme(id) {
  const res = await query(
    "DELETE FROM certification_schemes WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

module.exports = {
  createScheme,
  getAllSchemes,
  getTotalSchemes,
  getSchemeById,
  updateScheme,
  deleteScheme,
};
