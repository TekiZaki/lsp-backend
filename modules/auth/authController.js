// lsp-backend/modules/auth/authController.js
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/jwt");
const authModel = require("./authModel");
const globalModel = require("../../models/globalModel");
const { getClient } = require("../../utils/db");
const { adminSecret } = require("../../config/jwt");
const notificationController = require("../notification/NotificationController");

// ====================================================================
// REGISTRASI ASESI (Public endpoint)
// ====================================================================
async function register(request, reply) {
  const client = await getClient();
  try {
    const {
      username,
      password,
      email,
      full_name,
      ktp_number,
      phone_number,
      address,
    } = request.body;

    const role_name = "Asesi";

    if (!username || !password || !email || !full_name || !ktp_number) {
      return reply.status(400).send({ message: "Required fields are missing" });
    }

    await client.query("BEGIN");

    // 1. Cek username
    const existingUser = await authModel.findUserByUsername(username);
    if (existingUser) {
      await client.query("ROLLBACK");
      return reply
        .status(409)
        .send({ message: "Username (NPP) already taken" });
    }

    // 2. Dapatkan role_id 'Asesi'
    const role = await globalModel.getRoleByName(role_name);
    if (!role) {
      await client.query("ROLLBACK");
      return reply.status(400).send({ message: "Role 'Asesi' not found" });
    }
    const role_id = role.id;

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat user baru (Tabel users)
    const newUser = await authModel.createUser(
      client,
      username,
      hashedPassword,
      email,
      role_id,
    );

    // 5. Buat profil Asesi (Tabel asesi_profiles)
    await authModel.createAsesiProfile(client, newUser.id, {
      full_name,
      phone_number,
      address,
      ktp_number,
    });

    await client.query("COMMIT");

    // NEW: Create a notification for public registration
    await notificationController.createNotification(
      "new_user",
      "Pendaftar Asesi Baru",
      `Asesi "${full_name}" dengan KTP ${ktp_number} telah mendaftar mandiri.`,
      newUser.id,
    );

    reply.status(201).send({
      message: "Asesi registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during Asesi registration:", error);
    reply.status(500).send({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

// ====================================================================
// REGISTRASI ADMIN/ASESOR (Secret key required)
// ====================================================================
async function registerAdminOrAsesor(request, reply) {
  const client = await getClient();
  try {
    const {
      username,
      password,
      email,
      role_name, // 'Admin' or 'Asesor'
      admin_secret, // Secret key
      // Profile data
      full_name,
      reg_number, // for Asesor
      // Admin specific fields (optional)
      avatar_url,
      nomor_induk,
      nomor_lisensi,
      masa_berlaku,
      nomor_ktp,
      ttl,
      alamat,
      nomor_hp,
      pendidikan,
    } = request.body;

    // 1. Verifikasi Admin Secret
    if (admin_secret !== adminSecret) {
      return reply.status(403).send({ message: "Invalid admin secret key" });
    }

    if (role_name !== "Admin" && role_name !== "Asesor") {
      return reply.status(400).send({ message: "Invalid role_name specified" });
    }

    if (!username || !password || !email || !full_name) {
      return reply.status(400).send({ message: "Required fields are missing" });
    }

    // Validasi field spesifik
    if (role_name === "Asesor" && !reg_number) {
      return reply
        .status(400)
        .send({ message: "Registration number is required for Asesor" });
    }

    await client.query("BEGIN");

    // 2. Cek username
    const existingUser = await authModel.findUserByUsername(username);
    if (existingUser) {
      await client.query("ROLLBACK");
      return reply.status(409).send({ message: "Username already taken" });
    }

    // 3. Dapatkan role_id
    const role = await globalModel.getRoleByName(role_name);
    if (!role) {
      await client.query("ROLLBACK");
      return reply
        .status(400)
        .send({ message: `Role '${role_name}' not found` });
    }
    const role_id = role.id;

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Buat user baru
    const newUser = await authModel.createUser(
      client,
      username,
      hashedPassword,
      email,
      role_id,
    );

    // 6. Buat profil
    if (role_name === "Admin") {
      await authModel.createAdminProfile(client, newUser.id, {
        full_name,
        avatar_url,
        nomor_induk,
        nomor_lisensi,
        masa_berlaku,
        nomor_ktp,
        ttl,
        alamat,
        nomor_hp,
        email, // Can reuse the user's email
        pendidikan,
      });
    } else if (role_name === "Asesor") {
      await authModel.createAsesorProfile(client, newUser.id, {
        full_name,
        reg_number,
      });
    }

    await client.query("COMMIT");

    reply.status(201).send({
      message: `${role_name} registered successfully`,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
        role_name: role_name,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      `Error during ${request.body.role_name} registration:`,
      error,
    );
    reply.status(500).send({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

// ====================================================================
// LOGIN
// ====================================================================
async function login(request, reply) {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply
        .status(400)
        .send({ message: "Username (NPP) and password are required" });
    }

    const user = await authModel.findUserByUsername(username);
    if (!user) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    // Menggunakan Bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    // Dapatkan nama peran untuk disimpan di token (opsional, tapi membantu)
    const role = await globalModel.getRoleById(user.role_id);

    const token = generateToken({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      role_name: role ? role.name : "Unknown",
    });

    reply.send({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        role_name: role ? role.name : "Unknown",
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// ====================================================================
// FORGOT PASSWORD (Hanya untuk Admin/Asesor/Asesi yang lupa password)
// Asumsi: Ini adalah proses reset (ganti password tanpa login, tapi dengan verifikasi KTP/Email)
// Karena kita tidak mengimplementasikan email, kita simulasikan proses verifikasi.
// ====================================================================
async function forgotPassword(request, reply) {
  const client = await getClient();
  try {
    const { username, email, new_password } = request.body;

    if (!username || !email || !new_password) {
      return reply
        .status(400)
        .send({ message: "Username, email, and new password are required" });
    }

    const user = await authModel.findUserByUsername(username);
    if (!user || user.email !== email) {
      return reply
        .status(401)
        .send({ message: "Invalid username or email verification." });
    }

    await client.query("BEGIN");

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await authModel.updatePasswordByUsername(client, username, hashedPassword);

    await client.query("COMMIT");

    reply.send({
      message:
        "Password has been successfully reset. Please log in with your new password.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during forgot password process:", error);
    reply.status(500).send({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

module.exports = {
  register,
  registerAdminOrAsesor, // Export baru
  login,
  forgotPassword,
};
