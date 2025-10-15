// lsp-backend/modules/juk/JadwalUjiKompetensiRoutes.js
const jukController = require("./JadwalUjiKompetensiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function jukRoutes(fastify, options) {
  // Hanya Admin yang boleh mengatur jadwal (CRUD)
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  // Semua user terautentikasi (termasuk Asesor dan Asesi) boleh melihat jadwal
  const preHandlerAuth = [authenticate];

  // GET All JUK (Auth required)
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    jukController.getAllJuksHandler
  );

  // GET JUK by ID (Auth required)
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    jukController.getJukByIdHandler
  );

  // CRUD (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    jukController.createJukHandler
  );
  fastify.put(
    "/:id",
    { preHandler: preHandlerAdmin },
    jukController.updateJukHandler
  );
  fastify.delete(
    "/:id",
    { preHandler: preHandlerAdmin },
    jukController.deleteJukHandler
  );
}

module.exports = jukRoutes;
