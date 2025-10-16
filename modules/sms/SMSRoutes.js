// lsp-backend/modules/sms/SMSRoutes.js
const smsController = require("./SMSController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function smsRoutes(fastify, options) {
  const adminOnly = { preHandler: [authenticate, authorize(["Admin"])] };

  fastify.get("/masuk", adminOnly, smsController.getSmsMasuk);
  fastify.get("/keluar", adminOnly, smsController.getSmsKeluar);
  fastify.post("/kirim", adminOnly, smsController.sendSms);
}

module.exports = smsRoutes;
