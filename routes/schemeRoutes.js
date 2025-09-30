// routes/schemeRoutes.js
const schemeController = require("../controllers/schemeController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

async function schemeRoutes(fastify, options) {
  // Hanya Admin yang bisa CRUD Skema
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    schemeController.getAllSchemesHandler
  );
  // fastify.get("/:id", { preHandler: preHandlerAuth }, schemeController.getSchemeByIdHandler);

  // fastify.post("/", { preHandler: preHandlerAdmin }, schemeController.createSchemeHandler);
  // fastify.put("/:id", { preHandler: preHandlerAdmin }, schemeController.updateSchemeHandler);
  // fastify.delete("/:id", { preHandler: preHandlerAdmin }, schemeController.deleteSchemeHandler);

  // Rute untuk persyaratan skema (nested resource)
  // fastify.get("/:schemeId/requirements", { preHandler: preHandlerAuth }, schemeController.getRequirementsHandler);
  // fastify.post("/:schemeId/requirements", { preHandler: preHandlerAdmin }, schemeController.createRequirementHandler);
}

module.exports = schemeRoutes;
