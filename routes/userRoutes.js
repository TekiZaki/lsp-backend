// routes/userRoutes.js
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");

async function userRoutes(fastify, options) {
  // Rute yang membutuhkan autentikasi
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
  // ... rute user lain yang dilindungi
}

module.exports = userRoutes;
