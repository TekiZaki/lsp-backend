// lsp-backend/modules/lsp/LembagaSertifikasiProfesiModel.js
const { query } = require("../../utils/db");
const { mapToSnakeCase, mapToCamelCase } = require("../../utils/dataMapper"); // Import utilitas

async function createLsp(lspData) {
  // 1. Konversi data dari camelCase ke snake_case
  const snakeCaseData = mapToSnakeCase(lspData);

  // Filter keys yang valid (sesuai skema lsp_institutions)
  // Karena kita tidak memiliki skema DB di sini, kita asumsikan semua key yang dikirim adalah valid.
  const keys = Object.keys(snakeCaseData);
  const values = Object.values(snakeCaseData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO lsp_institutions (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );

  // 2. Konversi hasil kembali ke camelCase sebelum dikembalikan
  return mapToCamelCase(res.rows[0]);
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
  // 3. Konversi hasil kembali ke camelCase
  return mapToCamelCase(res.rows);
}

async function getLspById(id) {
  const res = await query("SELECT * FROM lsp_institutions WHERE id = $1", [id]);
  // 4. Konversi hasil kembali ke camelCase
  return mapToCamelCase(res.rows[0]);
}

async function updateLsp(id, lspData) {
  // 1. Konversi data dari camelCase ke snake_case
  const snakeCaseData = mapToSnakeCase(lspData);

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const key in snakeCaseData) {
    if (snakeCaseData.hasOwnProperty(key)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(snakeCaseData[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return null; // Tidak ada data untuk diupdate
  }

  // Tambahkan updated_at
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id); // ID adalah parameter terakhir

  const res = await query(
    `UPDATE lsp_institutions SET ${updates.join(
      ", "
    )} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  // 2. Konversi hasil kembali ke camelCase
  return mapToCamelCase(res.rows[0]);
}

async function deleteLsp(id) {
  const res = await query(
    "DELETE FROM lsp_institutions WHERE id = $1 RETURNING id",
    [id]
  );
  // 3. Konversi hasil kembali ke camelCase (hanya ID yang terpengaruh)
  return mapToCamelCase(res.rows[0]);
}

async function getTotalLsps(search) {
  let queryText = "SELECT COUNT(*) FROM lsp_institutions";
  let queryParams = [];
  let conditions = [];

  if (search) {
    // Note: Search tetap menggunakan snake_case karena berinteraksi langsung dengan DB
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
