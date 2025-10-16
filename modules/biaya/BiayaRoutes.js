// lsp-backend/modules/biaya/BiayaRoutes.js
const biayaController = require("./BiayaController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function biayaRoutes(fastify, options) {
  const adminOnly = { preHandler: [authenticate, authorize(["Admin"])] };

  fastify.get("/", adminOnly, biayaController.getAllBiaya);
  fastify.get("/:id", adminOnly, biayaController.getBiayaById);
  fastify.post("/", adminOnly, biayaController.createBiaya);
  fastify.put("/:id", adminOnly, biayaController.updateBiaya);
  fastify.delete("/:id", adminOnly, biayaController.deleteBiaya);
}

module.exports = biayaRoutes;
