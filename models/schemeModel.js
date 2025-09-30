// models/schemeModel.js
const { query } = require("../utils/db");

async function createScheme(schemeData) {
  const {
    name,
    code,
    description,
    skkni, // Asumsi field SKKNI ditambahkan di tabel schemes
    keterangan_bukti, // Tambahan untuk simulasi data frontend
  } = schemeData;

  const res = await query(
    `INSERT INTO certification_schemes (
        name, code, description, skkni, keterangan_bukti
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, code, description, skkni, keterangan_bukti]
  );
  return res.rows[0];
}

async function getAllSchemes({ search, limit, offset }) {
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
  return res.rows;
}

// ... (getById, update, delete, getTotal methods, similar to lspModel)
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

module.exports = {
  createScheme,
  getAllSchemes,
  getTotalSchemes,
};
