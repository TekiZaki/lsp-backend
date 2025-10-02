// lsp-backend/modules/tuk/TempatUjiKompetensiRoutes.js
const tukController = require("./TempatUjiKompetensiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function tukRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  // GET All TUK (Auth required)
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    tukController.getAllTuksHandler
  );

  // GET TUK by ID (Auth required)
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    tukController.getTukByIdHandler
  );

  // CRUD (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    tukController.createTukHandler
  );
  fastify.put(
    "/:id",
    { preHandler: preHandlerAdmin },
    tukController.updateTukHandler
  );
  fastify.delete(
    "/:id",
    { preHandler: preHandlerAdmin },
    tukController.deleteTukHandler
  );
}

module.exports = tukRoutes;
