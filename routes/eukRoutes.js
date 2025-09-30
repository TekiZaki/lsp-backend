// routes/eukRoutes.js
const eukController = require("../controllers/eukController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

async function eukRoutes(fastify, options) {
  // Hanya Admin yang bisa CRUD EUK
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    eukController.getAllEuksHandler
  );
  // fastify.get("/:id", { preHandler: preHandlerAuth }, eukController.getEukByIdHandler);

  // fastify.post("/", { preHandler: preHandlerAdmin }, eukController.createEukHandler);
  // fastify.put("/:id", { preHandler: preHandlerAdmin }, eukController.updateEukHandler);
  // fastify.delete("/:id", { preHandler: preHandlerAdmin }, eukController.deleteEukHandler);
}

module.exports = eukRoutes;
