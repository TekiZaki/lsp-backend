// lsp-backend/modules/user/userModel.js
const { query } = require("../../utils/db");

async function findUserById(userId) {
  const res = await query(
    `
    SELECT
        up.id, up.username, up.email, up.role_id, r.name AS role_name, -- Changed from u. to up.
        -- Asesi Data
        ap.full_name AS asesi_full_name, ap.phone_number, ap.address, ap.ktp_number,
        -- Asesor Data
        asr.full_name AS asesor_full_name, asr.reg_number, asr.is_certified,
        -- Admin Data
        adm.full_name AS admin_full_name, adm.avatar_url, adm.nomor_induk,
        adm.nomor_lisensi, adm.masa_berlaku, adm.nomor_ktp AS admin_nomor_ktp, adm.ttl,
        adm.alamat AS admin_alamat, adm.nomor_hp, adm.email AS admin_email, adm.pendidikan
    FROM user_profiles up -- Changed from users u to user_profiles up
    LEFT JOIN roles r ON up.role_id = r.id
    LEFT JOIN asesi_profiles ap ON up.id = ap.user_id
    LEFT JOIN asesor_profiles asr ON up.id = asr.user_id
    LEFT JOIN admin_profiles adm ON up.id = adm.user_id
    WHERE up.id = $1 -- Changed from u.id to up.id
    `,
    [userId],
  );

  const user = res.rows[0];
  if (!user) return null;

  // Cleanup and map profile data based on role
  const profile = {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.role_id,
    roleName: user.role_name,
    profileData: {},
  };

  if (user.role_name === "Asesi") {
    profile.profileData = {
      fullName: user.asesi_full_name,
      phoneNumber: user.phone_number,
      address: user.address,
      ktpNumber: user.ktp_number,
    };
  } else if (user.role_name === "Asesor") {
    profile.profileData = {
      fullName: user.asesor_full_name,
      regNumber: user.reg_number,
      isCertified: user.is_certified,
    };
  } else if (user.role_name === "Admin") {
    profile.profileData = {
      fullName: user.admin_full_name,
      avatarUrl: user.avatar_url,
      nomorInduk: user.nomor_induk,
      nomorLisensi: user.nomor_lisensi,
      masaBerlaku: user.masa_berlaku,
      nomorKTP: user.admin_nomor_ktp,
      ttl: user.ttl,
      alamat: user.admin_alamat,
      nomorHP: user.nomor_hp,
      email: user.admin_email,
      pendidikan: user.pendidikan,
    };
  }

  return profile;
}

// Digunakan untuk Login dan Change Password (perlu password hash)
async function findUserWithPassword(userId) {
  // Changed from 'users' to 'user_profiles'
  const res = await query(
    "SELECT id, username, password, email, role_id FROM user_profiles WHERE id = $1",
    [userId],
  );
  return res.rows[0];
}

// Model yang ada di authModel, tapi perlu di sini untuk changePassword
async function findUserByUsername(username) {
  // Changed from 'users' to 'user_profiles'
  const res = await query(
    "SELECT id, username, password, email, role_id FROM user_profiles WHERE username = $1",
    [username],
  );
  return res.rows[0];
}

async function updateUserPassword(userId, hashedPassword) {
  // Changed from 'users' to 'user_profiles'
  const res = await query(
    "UPDATE user_profiles SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id",
    [hashedPassword, userId],
  );
  return res.rows[0];
}

module.exports = {
  findUserById,
  findUserWithPassword,
  findUserByUsername,
  updateUserPassword,
};
