// lsp-backend/modules/puk/PesertaUjiKompetensiRoutes.js
const pukController = require("./PesertaUjiKompetensiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function pesertaUjiKompetensiRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate]; // Asesor juga mungkin perlu melihat daftar peserta

  // GET peserta by Jadwal ID
  // Example: GET /api/puks/jadwal/1/peserta
  fastify.get(
    "/jadwal/:jadwalId/peserta",
    { preHandler: preHandlerAuth },
    pukController.getPesertaByJadwalId
  );

  // POST add peserta to Jadwal
  // Example: POST /api/puks/jadwal/1/peserta { asesiId: 101 }
  fastify.post(
    "/jadwal/:jadwalId/peserta",
    { preHandler: preHandlerAdmin }, // Only Admin can add participants to a schedule
    pukController.addPesertaToJadwal
  );

  // DELETE remove peserta from Jadwal
  // Example: DELETE /api/puks/jadwal/1/peserta/5 (where 5 is the event_participants.id)
  fastify.delete(
    "/jadwal/:jadwalId/peserta/:pesertaId",
    { preHandler: preHandlerAdmin }, // Only Admin can remove participants from a schedule
    pukController.removePesertaFromJadwal
  );
}

module.exports = pesertaUjiKompetensiRoutes;
