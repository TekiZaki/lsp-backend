// lsp-backend/modules/uk/UnitKompetensiRoutes.js
const ukController = require("./UnitKompetensiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function unitKompetensiRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  // --- UNIT KOMPETENSI (UK) ---

  // GET All Units (Auth required, filter by schemeId opsional)
  // GET /api/units?schemeId=1
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    ukController.getAllUnitsHandler
  );

  // GET Unit Detail (termasuk Elemen dan KUK)
  // GET /api/units/:id
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    ukController.getUnitDetailHandler
  );

  // POST Create Unit (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    ukController.createUnitHandler
  );

  // --- ELEMEN KOMPETENSI (Nested under Unit) ---

  // POST Create Elemen (Admin only)
  // POST /api/units/:unitId/elemen
  fastify.post(
    "/:unitId/elemen",
    { preHandler: preHandlerAdmin },
    ukController.createElemenHandler
  );

  // --- KRITERIA UNJUK KERJA (KUK) (Nested under Elemen) ---

  // POST Create KUK (Admin only)
  // POST /api/units/elemen/:elemenId/kuk
  fastify.post(
    "/elemen/:elemenId/kuk",
    { preHandler: preHandlerAdmin },
    ukController.createKukHandler
  );
}

module.exports = unitKompetensiRoutes;
