// lsp-backend/modules/websiteContent/WebsiteContentModel.js
const { query } = require("../../utils/db");

async function create(data) {
  const {
    thumbnail_url,
    title,
    subtitle,
    publish_date,
    description,
    category,
    slate_content,
  } = data;
  const res = await query(
    `INSERT INTO website_content (thumbnail_url, title, subtitle, publish_date, description, category, slate_content)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      thumbnail_url,
      title,
      subtitle,
      publish_date,
      description,
      category,
      slate_content,
    ],
  );
  return res.rows[0];
}

async function findAll({ category, search, limit, offset }) {
  let queryText = "SELECT * FROM website_content WHERE 1=1";
  const queryParams = [];
  let paramIndex = 1;

  if (category) {
    queryText += ` AND category = $${paramIndex++}`;
    queryParams.push(category);
  }
  if (search) {
    queryText += ` AND (title ILIKE $${paramIndex} OR subtitle ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  queryText += " ORDER BY publish_date DESC";

  if (limit) {
    queryText += ` LIMIT $${paramIndex++}`;
    queryParams.push(limit);
  }
  if (offset !== undefined) {
    queryText += ` OFFSET $${paramIndex++}`;
    queryParams.push(offset);
  }

  const res = await query(queryText, queryParams);
  return res.rows;
}

async function countAll({ category, search }) {
  let queryText = "SELECT COUNT(*) FROM website_content WHERE 1=1";
  const queryParams = [];
  let paramIndex = 1;

  if (category) {
    queryText += ` AND category = $${paramIndex++}`;
    queryParams.push(category);
  }
  if (search) {
    queryText += ` AND (title ILIKE $${paramIndex} OR subtitle ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

async function findById(id) {
  const res = await query("SELECT * FROM website_content WHERE id = $1", [id]);
  return res.rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const res = await query(
    `UPDATE website_content SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values,
  );
  return res.rows[0];
}

async function remove(id) {
  const res = await query(
    "DELETE FROM website_content WHERE id = $1 RETURNING id",
    [id],
  );
  return res.rows[0];
}

module.exports = {
  create,
  findAll,
  countAll,
  findById,
  update,
  remove,
};
