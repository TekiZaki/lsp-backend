// routes/tukRoutes.js
const tukController = require("../controllers/tukController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

async function tukRoutes(fastify, options) {
  // Hanya Admin yang bisa CRUD TUK
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    tukController.getAllTuksHandler
  );
  // fastify.get("/:id", { preHandler: preHandlerAuth }, tukController.getTukByIdHandler);

  // fastify.post("/", { preHandler: preHandlerAdmin }, tukController.createTukHandler);
  // fastify.put("/:id", { preHandler: preHandlerAdmin }, tukController.updateTukHandler);
  // fastify.delete("/:id", { preHandler: preHandlerAdmin }, tukController.deleteTukHandler);
}

module.exports = tukRoutes;
