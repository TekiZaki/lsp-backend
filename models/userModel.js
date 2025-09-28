// models/userModel.js
const { query } = require("../utils/db");
const bcrypt = require("bcryptjs"); // Tambahkan ini karena updateUserPassword akan membutuhkannya untuk hash password baru

async function createUser(userData) {
  const { username, password, email, role_id } = userData;
  const res = await query(
    "INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id",
    [username, password, email, role_id]
  );
  return res.rows[0];
}

async function findUserByUsername(username) {
  // Kita mungkin butuh password untuk verifikasi login, jadi SELECT *
  const res = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return res.rows[0];
}

async function findUserById(id) {
  // Untuk profil, kita tidak perlu mengembalikan password
  const res = await query(
    "SELECT id, username, email, role_id FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0];
}

async function getRoleByName(roleName) {
  const res = await query("SELECT id FROM roles WHERE name = $1", [roleName]);
  return res.rows[0];
}

async function updateUserPassword(userId, hashedPassword) {
  const res = await query(
    "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id",
    [hashedPassword, userId]
  );
  return res.rows[0];
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  getRoleByName,
  updateUserPassword, // Ekspor fungsi baru
};
