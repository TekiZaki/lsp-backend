// lsp-backend/modules/rekening/RekeningRoutes.js
const rekeningController = require("./RekeningController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function rekeningRoutes(fastify, options) {
  const adminOnly = { preHandler: [authenticate, authorize(["Admin"])] };

  fastify.get("/", adminOnly, rekeningController.getAllRekening);
  fastify.post("/", adminOnly, rekeningController.createRekening);
  fastify.put("/:id", adminOnly, rekeningController.updateRekening);
  fastify.delete("/:id", adminOnly, rekeningController.deleteRekening);
}

module.exports = rekeningRoutes;
