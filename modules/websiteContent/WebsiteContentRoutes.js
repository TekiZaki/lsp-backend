// lsp-backend/modules/websiteContent/WebsiteContentRoutes.js
const websiteContentController = require("./WebsiteContentController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function websiteContentRoutes(fastify, options) {
  const adminOnly = { preHandler: [authenticate, authorize(["Admin"])] };
  const authRequired = { preHandler: [authenticate] };
  const publicAccess = {}; // For public content, no auth needed

  // Publicly accessible content (e.g., for general website display)
  fastify.get("/", publicAccess, websiteContentController.getAllContent);
  fastify.get("/:id", publicAccess, websiteContentController.getContentById);

  // Admin-only routes for managing content
  fastify.post("/", adminOnly, websiteContentController.createContent);
  fastify.put("/:id", adminOnly, websiteContentController.updateContent);
  fastify.delete("/:id", adminOnly, websiteContentController.deleteContent);
}

module.exports = websiteContentRoutes;
