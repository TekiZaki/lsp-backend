// lsp-backend/modules/notification/NotificationModel.js
const { query } = require("../../utils/db");

async function create(data) {
  const { user_id, type, title, message, is_read } = data;
  const res = await query(
    `INSERT INTO notifications (user_id, type, title, message, is_read)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, type, title, message, is_read || false],
  );
  return res.rows[0];
}

async function findAll({ userId, isRead, limit, offset }) {
  let queryText = "SELECT * FROM notifications WHERE 1=1";
  const queryParams = [];
  let paramIndex = 1;

  if (userId) {
    queryText += ` AND user_id = $${paramIndex++}`;
    queryParams.push(userId);
  }
  if (isRead !== undefined && isRead !== null) {
    queryText += ` AND is_read = $${paramIndex++}`;
    queryParams.push(isRead);
  }

  queryText += " ORDER BY created_at DESC";

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

async function countAll({ userId, isRead }) {
  let queryText = "SELECT COUNT(*) FROM notifications WHERE 1=1";
  const queryParams = [];
  let paramIndex = 1;

  if (userId) {
    queryText += ` AND user_id = $${paramIndex++}`;
    queryParams.push(userId);
  }
  if (isRead !== undefined && isRead !== null) {
    queryText += ` AND is_read = $${paramIndex++}`;
    queryParams.push(isRead);
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

async function findById(id) {
  const res = await query("SELECT * FROM notifications WHERE id = $1", [id]);
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
    `UPDATE notifications SET ${fields.join(", ")}, created_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values,
  );
  return res.rows[0];
}

async function remove(id) {
  const res = await query(
    "DELETE FROM notifications WHERE id = $1 RETURNING id",
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
