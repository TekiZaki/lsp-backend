// lsp-backend/modules/notification/NotificationRoutes.js
const notificationController = require("./NotificationController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function notificationRoutes(fastify, options) {
  const authRequired = { preHandler: [authenticate] };
  // Only Admin can create/delete notifications, but for the purpose of a notification system,
  // we primarily focus on listing and marking as read by any authenticated user.
  // The 'create' method is usually called internally by other services.

  // Get all notifications for the authenticated user (or all if userId is not in query)
  fastify.get("/", authRequired, notificationController.getAllNotifications);

  // Get a specific notification
  fastify.get("/:id", authRequired, notificationController.getNotificationById);

  // Mark a notification as read
  fastify.patch(
    "/:id/read",
    authRequired,
    notificationController.markNotificationAsRead,
  );

  // If you want to expose creation/deletion for Admin (less common for a notification system
  // as notifications are usually triggered by events)
  // fastify.post("/", { preHandler: [authenticate, authorize(["Admin"])] }, notificationController.createNotificationHandler);
  // fastify.delete("/:id", { preHandler: [authenticate, authorize(["Admin"])] }, notificationController.deleteNotificationHandler);
}

module.exports = notificationRoutes;
