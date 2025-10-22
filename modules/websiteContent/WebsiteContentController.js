// lsp-backend/modules/websiteContent/WebsiteContentController.js
const websiteContentModel = require("./WebsiteContentModel");
const { mapToCamelCase, mapToSnakeCase } = require("../../utils/dataMapper");

async function createContent(request, reply) {
  try {
    // Ensure slateContent is stored as JSONB
    const contentData = mapToSnakeCase(request.body);
    if (contentData.slate_content) {
      contentData.slate_content = JSON.stringify(contentData.slate_content);
    }
    const newContent = await websiteContentModel.create(contentData);
    reply.status(201).send(mapToCamelCase(newContent));
  } catch (error) {
    console.error("Error creating website content:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getAllContent(request, reply) {
  try {
    const { category, search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const data = await websiteContentModel.findAll({
      category,
      search,
      limit,
      offset,
    });
    const total = await websiteContentModel.countAll({ category, search });

    reply.send({
      message: "Website content retrieved successfully",
      data: mapToCamelCase(data),
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all website content:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getContentById(request, reply) {
  try {
    const { id } = request.params;
    const data = await websiteContentModel.findById(id);
    if (!data) {
      return reply.status(404).send({ message: "Website content not found" });
    }
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting website content by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateContent(request, reply) {
  try {
    const { id } = request.params;
    const contentData = mapToSnakeCase(request.body);
    if (contentData.slate_content) {
      contentData.slate_content = JSON.stringify(contentData.slate_content);
    }
    const updatedData = await websiteContentModel.update(id, contentData);
    if (!updatedData) {
      return reply.status(404).send({ message: "Website content not found" });
    }
    reply.send(mapToCamelCase(updatedData));
  } catch (error) {
    console.error("Error updating website content:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteContent(request, reply) {
  try {
    const { id } = request.params;
    const deletedData = await websiteContentModel.remove(id);
    if (!deletedData) {
      return reply.status(404).send({ message: "Website content not found" });
    }
    reply.send({
      message: "Website content deleted successfully",
      deletedId: deletedData.id,
    });
  } catch (error) {
    console.error("Error deleting website content:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
};
