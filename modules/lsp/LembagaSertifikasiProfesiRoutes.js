// lsp-backend/modules/lsp/LembagaSertifikasiProfesiRoutes.js
const lspController = require("./LembagaSertifikasiProfesiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function lspRoutes(fastify, options) {
  // GET /api/lsps
  fastify.get(
    "/",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getAllLspsHandler
  );
  // GET /api/lsps/:id
  fastify.get(
    "/:id",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getLspByIdHandler
  );

  // POST /api/lsps (Hanya Admin)
  fastify.post(
    "/",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.createLspHandler
  );
  // PUT /api/lsps/:id (Hanya Admin)
  fastify.put(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.updateLspHandler
  );
  // DELETE /api/lsps/:id (Hanya Admin)
  fastify.delete(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.deleteLspHandler
  );
}

module.exports = lspRoutes;
