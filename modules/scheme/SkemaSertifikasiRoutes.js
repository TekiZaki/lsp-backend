// lsp-backend/modules/scheme/SkemaSertifikasiRoutes.js
const schemeController = require("./SkemaSertifikasiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function schemeRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  // GET All Schemes (Auth required)
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    schemeController.getAllSchemesHandler
  );

  // GET Scheme by ID (Auth required)
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    schemeController.getSchemeByIdHandler
  );

  // CRUD (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    schemeController.createSchemeHandler
  );
  fastify.put(
    "/:id",
    { preHandler: preHandlerAdmin },
    schemeController.updateSchemeHandler
  );
  fastify.delete(
    "/:id",
    { preHandler: preHandlerAdmin },
    schemeController.deleteSchemeHandler
  );

  // Rute untuk persyaratan skema (nested resource)
  // fastify.get("/:schemeId/requirements", { preHandler: preHandlerAuth }, schemeController.getRequirementsHandler);
}

module.exports = schemeRoutes;
