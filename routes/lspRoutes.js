// routes/lspRoutes.js
const lspController = require("../controllers/lspController");
const authenticate = require("../middlewares/authMiddleware"); // Untuk melindungi rute
const authorize = require("../middlewares/authorizeMiddleware"); // Middleware baru untuk otorisasi

async function lspRoutes(fastify, options) {
  // Memerlukan autentikasi untuk semua operasi LSP
  // Dan mungkin otorisasi (misal: hanya Admin yang bisa CRUD LSP)

  // GET /api/lsps - Dapatkan semua LSP (bisa diakses publik atau hanya user terautentikasi)
  fastify.get(
    "/",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getAllLspsHandler
  );
  // GET /api/lsps/:id - Dapatkan LSP berdasarkan ID
  fastify.get(
    "/:id",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getLspByIdHandler
  );

  // POST /api/lsps - Buat LSP baru (Hanya Admin)
  fastify.post(
    "/",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.createLspHandler
  );
  // PUT /api/lsps/:id - Perbarui LSP (Hanya Admin)
  fastify.put(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.updateLspHandler
  );
  // DELETE /api/lsps/:id - Hapus LSP (Hanya Admin)
  fastify.delete(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.deleteLspHandler
  );
}

module.exports = lspRoutes;
