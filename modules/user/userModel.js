// lsp-backend/modules/user/userModel.js
const { query } = require("../../utils/db");

async function findUserById(userId) {
  const res = await query(
    `SELECT 
        u.id, u.username, u.email, u.role_id, r.name AS role_name,
        ap.full_name, ap.phone_number, ap.address, ap.ktp_number
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN asesi_profiles ap ON u.id = ap.user_id
    WHERE u.id = $1`,
    [userId]
  );
  return res.rows[0];
}

async function findUserByUsername(username) {
  // Khusus untuk mendapatkan password saat verifikasi ganti password
  const res = await query(
    "SELECT id, username, password, email, role_id FROM users WHERE username = $1",
    [username]
  );
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
  findUserById,
  findUserByUsername,
  updateUserPassword,
};
