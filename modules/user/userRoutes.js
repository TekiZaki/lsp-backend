// lsp-backend/modules/user/userRoutes.js
const userController = require("./userController");
const authenticate = require("../../middlewares/authMiddleware");

async function userRoutes(fastify, options) {
  // Semua rute di sini memerlukan autentikasi
  fastify.get(
    "/profile",
    { preHandler: [authenticate] },
    userController.getMyProfile
  );
  fastify.post(
    "/change-password",
    { preHandler: [authenticate] },
    userController.changePassword
  );
}

module.exports = userRoutes;
