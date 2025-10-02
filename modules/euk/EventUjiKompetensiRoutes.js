// lsp-backend/modules/euk/EventUjiKompetensiRoutes.js
const eukController = require("./EventUjiKompetensiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function eukRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  // GET All EUK (Auth required)
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    eukController.getAllEuksHandler
  );

  // GET EUK by ID (Auth required)
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    eukController.getEukByIdHandler
  );

  // CRUD (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    eukController.createEukHandler
  );
  fastify.put(
    "/:id",
    { preHandler: preHandlerAdmin },
    eukController.updateEukHandler
  );
  fastify.delete(
    "/:id",
    { preHandler: preHandlerAdmin },
    eukController.deleteEukHandler
  );
}

module.exports = eukRoutes;
