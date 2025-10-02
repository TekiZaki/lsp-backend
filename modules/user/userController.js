// lsp-backend/modules/user/userController.js
const userModel = require("./userModel");
const bcrypt = require("bcryptjs");

async function getMyProfile(request, reply) {
  try {
    const userId = request.user.id;
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
    const userWithPassword = await userModel.findUserByUsername(
      request.user.username
    );
    if (!userWithPassword || userWithPassword.id !== userId) {
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

module.exports = {
  getMyProfile,
  changePassword,
};
