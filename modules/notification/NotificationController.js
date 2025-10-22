// lsp-backend/modules/notification/NotificationController.js
const notificationModel = require("./NotificationModel");
const { mapToCamelCase } = require("../../utils/dataMapper");

async function getAllNotifications(request, reply) {
  try {
    const { userId, isRead, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const filter = { userId, isRead }; // Pass userId for user-specific notifications if applicable
    const data = await notificationModel.findAll({ ...filter, limit, offset });
    const total = await notificationModel.countAll(filter);

    reply.send({
      message: "Notifications retrieved successfully",
      data: mapToCamelCase(data),
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all notifications:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getNotificationById(request, reply) {
  try {
    const { id } = request.params;
    const data = await notificationModel.findById(id);
    if (!data) {
      return reply.status(404).send({ message: "Notification not found" });
    }
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting notification by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function markNotificationAsRead(request, reply) {
  try {
    const { id } = request.params;
    const updatedNotification = await notificationModel.update(id, {
      is_read: true,
    });
    if (!updatedNotification) {
      return reply.status(404).send({ message: "Notification not found" });
    }
    reply.send(
      mapToCamelCase({
        message: "Notification marked as read",
        data: updatedNotification,
      }),
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Internal function to create a new notification (can be called by other controllers)
async function createNotification(type, title, message, userId = null) {
  try {
    const newNotification = await notificationModel.create({
      user_id: userId,
      type,
      title,
      message,
    });
    return mapToCamelCase(newNotification);
  } catch (error) {
    console.error("Error creating notification internally:", error);
    // Depending on criticality, you might throw or just log
    return null;
  }
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  createNotification, // Export for internal use
};
