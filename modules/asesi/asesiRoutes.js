// lsp-backend/modules/asesi/asesiRoutes.js
const asesiController = require("./asesiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function asesiRoutes(fastify, options) {
  // ===========================================
  // Rute Publik (untuk menampilkan data Asesi umum)
  // ===========================================
  fastify.get("/public/provinces", asesiController.getProvincesWithAsesiCount);
  fastify.get(
    "/public/provinces/:provinsiId/cities",
    asesiController.getCitiesByProvinceId
  );
  fastify.get("/public/cities/:kotaId/asesi", asesiController.getAsesiByCityId);

  // ===========================================
  // Rute Terproteksi (Admin saja)
  // ===========================================

  // Mendapatkan semua asesi (dengan filter opsional)
  fastify.get(
    "/",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.getAllAsesi
  );

  // Mendapatkan detail asesi berdasarkan ID
  fastify.get(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.getAsesiById
  );

  // Membuat asesi baru (misalnya admin menambahkan manual)
  fastify.post(
    "/",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.createAsesi
  );

  // Memperbarui asesi
  fastify.put(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.updateAsesi
  );

  // Menghapus asesi
  fastify.delete(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.deleteAsesi
  );

  // Mengimpor data asesi dari Excel (massal)
  fastify.post(
    "/import",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.importAsesi
  );

  // Aksi spesifik
  fastify.patch(
    "/:id/verify",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.verifyAsesi
  );
  fastify.patch(
    "/:id/block",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.blockAsesi
  );
  fastify.patch(
    "/:id/unblock",
    { preHandler: [authenticate, authorize(["Admin"])] },
    asesiController.unblockAsesi
  );
}

module.exports = asesiRoutes;
