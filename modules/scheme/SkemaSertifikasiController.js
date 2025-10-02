// lsp-backend/modules/scheme/SkemaSertifikasiController.js
const schemeModel = require("./SkemaSertifikasiModel");

async function createSchemeHandler(request, reply) {
  try {
    const newScheme = await schemeModel.createScheme(request.body);
    reply
      .status(201)
      .send({ message: "Skema created successfully", data: newScheme });
  } catch (error) {
    console.error("Error creating Skema:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllSchemesHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const schemes = await schemeModel.getAllSchemes({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await schemeModel.getTotalSchemes(search);

    reply.send({
      message: "Schemes retrieved successfully",
      data: schemes,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all Schemes:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getSchemeByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const scheme = await schemeModel.getSchemeById(id);
    if (!scheme) {
      return reply.status(404).send({ message: "Skema not found" });
    }
    reply.send({ message: "Skema retrieved successfully", data: scheme });
  } catch (error) {
    console.error("Error getting Skema by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateSchemeHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedScheme = await schemeModel.updateScheme(id, request.body);
    if (!updatedScheme) {
      return reply.status(404).send({ message: "Skema not found" });
    }
    reply.send({ message: "Skema updated successfully", data: updatedScheme });
  } catch (error) {
    console.error("Error updating Skema:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteSchemeHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedScheme = await schemeModel.deleteScheme(id);
    if (!deletedScheme) {
      return reply.status(404).send({ message: "Skema not found" });
    }
    reply.send({ message: "Skema deleted successfully", id: deletedScheme.id });
  } catch (error) {
    console.error("Error deleting Skema:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createSchemeHandler,
  getAllSchemesHandler,
  getSchemeByIdHandler,
  updateSchemeHandler,
  deleteSchemeHandler,
};
