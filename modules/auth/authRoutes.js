// lsp-backend/modules/auth/authRoutes.js
const authController = require("./authController");

async function authRoutes(fastify, options) {
  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
  fastify.post("/forgot-password", authController.forgotPassword);
}

module.exports = authRoutes;
