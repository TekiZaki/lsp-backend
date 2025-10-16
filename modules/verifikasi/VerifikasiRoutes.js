// lsp-backend/modules/verifikasi/VerifikasiRoutes.js
const verifikasiController = require("./VerifikasiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function verifikasiRoutes(fastify, options) {
  const adminOnly = { preHandler: [authenticate, authorize(["Admin"])] };

  // Route to get all necessary data for the verification page of a specific asesi
  fastify.get(
    "/data/:asesiId",
    adminOnly,
    verifikasiController.getVerificationData
  );
}

module.exports = verifikasiRoutes;
