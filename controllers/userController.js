// controllers/userController.js
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs"); // Perlu untuk mengganti password

async function getMyProfile(request, reply) {
  try {
    // Data user berasal dari token yang didecode oleh middleware autentikasi
    const userId = request.user.id;
    // Kita bisa ambil data user lengkap dari model
    const user = await userModel.findUserById(userId);

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    reply.send({ message: "User profile retrieved successfully", user });
  } catch (error) {
    console.error("Error getting user profile:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function changePassword(request, reply) {
  try {
    const userId = request.user.id;
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return reply
        .status(400)
        .send({ message: "Current password and new password are required" });
    }

    // Ambil user dari database untuk memverifikasi password lama
    // Gunakan findUserById tapi ambil juga password-nya, atau buat fungsi khusus
    // Untuk saat ini, kita bisa modifikasi findUserById atau buat fungsi baru di model
    const userWithPassword = await userModel.findUserByUsername(
      request.user.username
    ); // Ambil user lengkap termasuk password
    if (!userWithPassword || userWithPassword.id !== userId) {
      // Pastikan user adalah user yang login
      return reply.status(404).send({ message: "User not found or mismatch" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );
    if (!isMatch) {
      return reply.status(401).send({ message: "Incorrect current password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    await userModel.updateUserPassword(userId, hashedPassword);

    reply.send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Hanya ekspor fungsi-fungsi controller
module.exports = {
  getMyProfile,
  changePassword,
};
