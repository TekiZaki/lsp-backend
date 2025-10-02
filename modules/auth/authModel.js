// lsp-backend/modules/auth/authModel.js
const { query } = require("../../utils/db");

async function findUserByUsername(username) {
  const res = await query(
    "SELECT id, username, password, email, role_id FROM users WHERE username = $1",
    [username]
  );
  return res.rows[0];
}

async function createUser(client, username, hashedPassword, email, role_id) {
  const res = await client.query(
    "INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id",
    [username, hashedPassword, email, role_id]
  );
  return res.rows[0];
}

async function createAsesiProfile(client, userId, profileData) {
  const { full_name, phone_number, address, ktp_number } = profileData;

  const res = await client.query(
    `INSERT INTO asesi_profiles (
        user_id, full_name, phone_number, address, ktp_number
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [userId, full_name, phone_number, address, ktp_number]
  );
  return res.rows[0];
}

module.exports = {
  findUserByUsername,
  createUser,
  createAsesiProfile,
};
