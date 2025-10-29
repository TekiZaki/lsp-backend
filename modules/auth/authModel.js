// lsp-backend/modules/auth/authModel.js
const { query } = require("../../utils/db");

async function findUserByUsername(username) {
  // Changed from 'users' to 'user_profiles'
  // Added 'password' to the SELECT, assuming it's stored in user_profiles for this backend's direct login.
  const res = await query(
    "SELECT id, username, password, email, role_id FROM user_profiles WHERE username = $1",
    [username],
  );
  return res.rows[0];
}

async function createUser(client, username, hashedPassword, email, role_id) {
  // Changed from 'users' to 'user_profiles'
  // Added 'auth_id' as NULL for now, assuming direct password management by the app.
  // In a real Supabase setup, `auth_id` would come from Supabase's own auth service.
  const res = await client.query(
    "INSERT INTO user_profiles (username, password, email, role_id, auth_id) VALUES ($1, $2, $3, $4, NULL) RETURNING id, username, email, role_id",
    [username, hashedPassword, email, role_id],
  );
  return res.rows[0];
}

async function createAsesiProfile(client, userId, profileData) {
  const { full_name, phone_number, address, ktp_number } = profileData;

  const res = await client.query(
    `INSERT INTO asesi_profiles (
        user_id, full_name, phone_number, address, ktp_number, registration_number
    ) VALUES ($1, $2, $3, $4, $5, gen_random_uuid()::text) -- Generate a unique registration_number if not provided
    RETURNING *`,
    [userId, full_name, phone_number, address, ktp_number],
  );
  return res.rows[0];
}

// NEW: Create Asesor Profile
async function createAsesorProfile(client, userId, profileData) {
  const { full_name, reg_number } = profileData;
  const res = await client.query(
    `INSERT INTO asesor_profiles (
        user_id, full_name, reg_number
    ) VALUES ($1, $2, $3)
    RETURNING *`,
    [userId, full_name, reg_number],
  );
  return res.rows[0];
}

// NEW: Create Admin Profile
async function createAdminProfile(client, userId, profileData) {
  const {
    full_name,
    avatar_url,
    nomor_induk,
    nomor_lisensi,
    masa_berlaku,
    nomor_ktp,
    ttl,
    alamat,
    nomor_hp,
    email,
    pendidikan,
  } = profileData;
  const res = await client.query(
    `INSERT INTO admin_profiles (
        user_id, full_name, avatar_url, nomor_induk, nomor_lisensi, masa_berlaku,
        nomor_ktp, ttl, alamat, nomor_hp, email, pendidikan
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      userId,
      full_name,
      avatar_url,
      nomor_induk,
      nomor_lisensi,
      masa_berlaku,
      nomor_ktp,
      ttl,
      alamat,
      nomor_hp,
      email,
      pendidikan,
    ],
  );
  return res.rows[0];
}

// NEW: Update password by username (for forgot password/reset)
async function updatePasswordByUsername(client, username, hashedPassword) {
  // Changed from 'users' to 'user_profiles'
  const res = await client.query(
    "UPDATE user_profiles SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2 RETURNING id",
    [hashedPassword, username],
  );
  return res.rows[0];
}

module.exports = {
  findUserByUsername,
  createUser,
  createAsesiProfile,
  createAsesorProfile,
  createAdminProfile,
  updatePasswordByUsername,
};
