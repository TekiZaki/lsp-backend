// lsp-backend/modules/auth/authRoutes.js
const authController = require("./authController");

async function authRoutes(fastify, options) {
  // Public
  fastify.post("/register/asesi", authController.register); // Mengganti /register menjadi /register/asesi
  fastify.post("/login", authController.login);
  fastify.post("/forgot-password", authController.forgotPassword);

  // Restricted Public (Needs ADMIN_SECRET in body)
  fastify.post("/register/privileged", authController.registerAdminOrAsesor);
}

module.exports = authRoutes;
