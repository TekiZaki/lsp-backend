// middlewares/authorizeMiddleware.js
const userModel = require("../models/userModel"); // Perlu untuk mendapatkan nama peran

const authorize =
  (roles = []) =>
  async (request, reply) => {
    if (typeof roles === "string") {
      roles = [roles];
    }

    if (!request.user || !request.user.role_id) {
      return reply
        .status(403)
        .send({ message: "Access denied. No role information." });
    }

    try {
      // Dapatkan nama peran dari ID peran
      const roleQueryResult = await userModel.getRoleById(request.user.role_id);
      if (!roleQueryResult || !roleQueryResult.name) {
        return reply
          .status(403)
          .send({ message: "Access denied. Invalid role." });
      }
      const userRoleName = roleQueryResult.name;

      // Periksa apakah peran pengguna termasuk dalam peran yang diizinkan
      if (roles.length && !roles.includes(userRoleName)) {
        return reply.status(403).send({
          message: "Access denied. You do not have the required role.",
        });
      }
    } catch (error) {
      console.error("Authorization error:", error);
      return reply
        .status(500)
        .send({ message: "Internal server error during authorization" });
    }
  };

module.exports = authorize;
