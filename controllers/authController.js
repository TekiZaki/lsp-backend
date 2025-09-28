// controllers/authController.js
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const userModel = require("../models/userModel");

async function register(request, reply) {
  try {
    const { username, password, email, role_name } = request.body;

    if (!username || !password || !email || !role_name) {
      return reply.status(400).send({ message: "All fields are required" });
    }

    // Cek apakah username sudah ada
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return reply.status(409).send({ message: "Username already taken" });
    }

    // Dapatkan role_id berdasarkan role_name
    const role = await userModel.getRoleByName(role_name);
    if (!role) {
      return reply.status(400).send({ message: "Invalid role name" });
    }
    const role_id = role.id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await userModel.createUser({
      username,
      password: hashedPassword,
      email,
      role_id,
    });

    reply.status(201).send({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function login(request, reply) {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply
        .status(400)
        .send({ message: "Username and password are required" });
    }

    // Cari user berdasarkan username
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    // Generate JWT
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

module.exports = {
  register,
  login,
};
