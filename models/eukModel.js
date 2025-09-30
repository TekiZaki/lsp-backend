// models/eukModel.js
const { query } = require("../utils/db");

async function createEuk(eukData) {
  const {
    scheme_id, // Skema yang diuji dalam event
    event_name,
    start_date,
    end_date,
    registration_deadline,
    location,
    description,
    max_participants,
    lsp_penyelenggara, // Tambahan untuk simulasi data frontend
    penanggung_jawab, // Tambahan untuk simulasi data frontend
  } = eukData;

  const res = await query(
    `INSERT INTO events (
        scheme_id, event_name, start_date, end_date, registration_deadline, location, description, max_participants, lsp_penyelenggara, penanggung_jawab
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      scheme_id,
      event_name,
      start_date,
      end_date,
      registration_deadline,
      location,
      description,
      max_participants,
      lsp_penyelenggara,
      penanggung_jawab,
    ]
  );
  return res.rows[0];
}

async function getAllEuks({ search, limit, offset }) {
  let queryText = "SELECT * FROM events";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(event_name) LIKE $1 OR LOWER(location) LIKE $1 OR LOWER(penanggung_jawab) LIKE $1)"
    );
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY start_date DESC";

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

module.exports = {
  createEuk,
  getAllEuks,
  getTotalEuks,
};
