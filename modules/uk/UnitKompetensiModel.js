// lsp-backend/modules/uk/UnitKompetensiModel.js
const { query, getClient } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper");

// --- UTILITY MAPPING ---

const mapUnitInputToDb = (input) => {
  const dbData = {
    scheme_id: input.schemeId, // Harus disiapkan di frontend/controller
    kode_unit: input.kodeUnit,
    nama_unit: input.namaUnit,
    jenis_standar: input.jenisStandar,
  };
  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );
  return dbData;
};

const mapUnitOutputToApi = (dbObject) => {
  if (!dbObject) return null;
  const camelCaseData = mapToCamelCase(dbObject);

  return {
    id: camelCaseData.id,
    kodeUnit: camelCaseData.kodeUnit,
    namaUnit: camelCaseData.namaUnit,
    jenisStandar: camelCaseData.jenisStandar,
    schemeId: camelCaseData.schemeId,
    // Data dari join
    skemaKode: dbObject.skema_kode,
    skemaNama: dbObject.skema_nama,
    elemenCount: parseInt(dbObject.elemen_count || 0),
    kriteriaCount: parseInt(dbObject.kriteria_count || 0),
  };
};

// --- CRUD UTAMA (Unit Kompetensi) ---

async function createUnit(unitData) {
  const dbData = mapUnitInputToDb(unitData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO unit_kompetensi (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapUnitOutputToApi(res.rows[0]);
}

async function getUnitById(id) {
  const res = await query(
    `
    SELECT 
        uk.*,
        s.code AS skema_kode, s.name AS skema_nama,
        COALESCE(e.elemen_count, 0) as elemen_count,
        COALESCE(k.kriteria_count, 0) as kriteria_count
    FROM unit_kompetensi uk
    JOIN certification_schemes s ON uk.scheme_id = s.id
    LEFT JOIN (SELECT unit_id, COUNT(*) as elemen_count FROM elemen_kompetensi GROUP BY unit_id) e ON uk.id = e.unit_id
    LEFT JOIN (
        SELECT eu.unit_id, COUNT(kuk.id) as kriteria_count
        FROM elemen_kompetensi eu
        JOIN kriteria_unjuk_kerja kuk ON eu.id = kuk.elemen_id
        GROUP BY eu.unit_id
    ) k ON uk.id = k.unit_id
    WHERE uk.id = $1
    `,
    [id]
  );
  return mapUnitOutputToApi(res.rows[0]);
}

async function getAllUnits({ search, limit, offset, schemeId }) {
  let queryText = `
    SELECT 
        uk.*, 
        s.code AS skema_kode, s.name AS skema_nama,
        COALESCE(e.elemen_count, 0) as elemen_count,
        COALESCE(k.kriteria_count, 0) as kriteria_count
    FROM unit_kompetensi uk
    JOIN certification_schemes s ON uk.scheme_id = s.id
    LEFT JOIN (SELECT unit_id, COUNT(*) as elemen_count FROM elemen_kompetensi GROUP BY unit_id) e ON uk.id = e.unit_id
    LEFT JOIN (
        SELECT eu.unit_id, COUNT(kuk.id) as kriteria_count
        FROM elemen_kompetensi eu
        JOIN kriteria_unjuk_kerja kuk ON eu.id = kuk.elemen_id
        GROUP BY eu.unit_id
    ) k ON uk.id = k.unit_id
  `;
  let queryParams = [];
  let conditions = [];
  let paramIndex = 1;

  if (schemeId) {
    conditions.push(`uk.scheme_id = $${paramIndex++}`);
    queryParams.push(schemeId);
  }

  if (search) {
    conditions.push(
      `(LOWER(uk.nama_unit) LIKE $${paramIndex} OR LOWER(uk.kode_unit) LIKE $${paramIndex})`
    );
    queryParams.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY uk.kode_unit ASC";

  if (limit) {
    queryParams.push(limit);
    queryText += ` LIMIT $${paramIndex++}`;
  }
  if (offset) {
    queryParams.push(offset);
    queryText += ` OFFSET $${paramIndex++}`;
  }

  const res = await query(queryText, queryParams);
  return res.rows.map(mapUnitOutputToApi);
}

async function getTotalUnits(search, schemeId) {
  let queryText = "SELECT COUNT(*) FROM unit_kompetensi uk";
  let queryParams = [];
  let conditions = [];
  let paramIndex = 1;

  if (schemeId) {
    conditions.push(`uk.scheme_id = $${paramIndex++}`);
    queryParams.push(schemeId);
  }

  if (search) {
    conditions.push(
      `(LOWER(uk.nama_unit) LIKE $${paramIndex} OR LOWER(uk.kode_unit) LIKE $${paramIndex})`
    );
    queryParams.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

// --- CRUD NESTED (Elemen dan KUK) ---

/**
 * Mendapatkan detail Unit Kompetensi, termasuk semua elemen dan KUK-nya.
 */
async function getUnitDetail(unitId) {
  const client = await getClient();
  try {
    // 1. Ambil detail Unit
    const unitRes = await client.query(
      `
      SELECT uk.*, s.code AS skema_kode, s.name AS skema_nama
      FROM unit_kompetensi uk
      JOIN certification_schemes s ON uk.scheme_id = s.id
      WHERE uk.id = $1
      `,
      [unitId]
    );
    const unit = mapUnitOutputToApi(unitRes.rows[0]);

    if (!unit) return null;

    // 2. Ambil semua Elemen untuk Unit ini
    const elemenRes = await client.query(
      "SELECT id, unit_id, nama_elemen FROM elemen_kompetensi WHERE unit_id = $1 ORDER BY id",
      [unitId]
    );
    const elemenList = mapToCamelCase(elemenRes.rows);

    // 3. Ambil semua Kriteria Unjuk Kerja (KUK) dan kelompokkan berdasarkan elemen_id
    const kukRes = await client.query(
      `
      SELECT kuk.id, kuk.elemen_id, kuk.deskripsi
      FROM kriteria_unjuk_kerja kuk
      JOIN elemen_kompetensi el ON kuk.elemen_id = el.id
      WHERE el.unit_id = $1
      ORDER BY kuk.id
      `,
      [unitId]
    );
    const kukList = mapToCamelCase(kukRes.rows);
    const kukMap = kukList.reduce((map, kuk) => {
      if (!map[kuk.elemenId]) map[kuk.elemenId] = [];
      map[kuk.elemenId].push(kuk);
      return map;
    }, {});

    // 4. Gabungkan Elemen dengan KUK
    unit.elemenKompetensi = elemenList.map((elemen) => ({
      ...elemen,
      kriteriaUnjukKerja: kukMap[elemen.id] || [],
    }));

    return unit;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

// Tambahkan Elemen Kompetensi
async function createElemen(unitId, namaElemen) {
  const res = await query(
    "INSERT INTO elemen_kompetensi (unit_id, nama_elemen) VALUES ($1, $2) RETURNING id, nama_elemen",
    [unitId, namaElemen]
  );
  return mapToCamelCase(res.rows[0]);
}

// Tambahkan Kriteria Unjuk Kerja (KUK)
async function createKuk(elemenId, deskripsi) {
  const res = await query(
    "INSERT INTO kriteria_unjuk_kerja (elemen_id, deskripsi) VALUES ($1, $2) RETURNING id, deskripsi",
    [elemenId, deskripsi]
  );
  return mapToCamelCase(res.rows[0]);
}

module.exports = {
  createUnit,
  getUnitById,
  getAllUnits,
  getTotalUnits,
  getUnitDetail,
  createElemen,
  createKuk,
  // ... (tambahkan fungsi update/delete di masa depan)
};
