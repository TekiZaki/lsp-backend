// lsp-backend/modules/auth/authController.js
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/jwt");
const authModel = require("./authModel");
const globalModel = require("../../models/globalModel"); // Impor Global Model
const { getClient } = require("../../utils/db");

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

    // 2. Dapatkan role_id 'Asesi' dari GlobalModel
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
      role_id
    );

    // 5. Buat profil Asesi (Tabel asesi_profiles)
    await authModel.createAsesiProfile(client, newUser.id, {
      full_name,
      phone_number,
      address,
      ktp_number,
    });

    await client.query("COMMIT");

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
    });

    reply.send({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function forgotPassword(request, reply) {
  // Logika Forgot Password tidak berubah
  try {
    const { npp, ktp_number, email } = request.body;

    if (!npp || !ktp_number || !email) {
      return reply.status(400).send({ message: "All fields are required" });
    }

    const user = await authModel.findUserByUsername(npp);
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    reply.send({
      message:
        "Jika data ditemukan, link reset password telah dikirimkan ke email Anda.",
    });
  } catch (error) {
    console.error("Error during forgot password process:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
};
