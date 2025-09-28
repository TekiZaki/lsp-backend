// controllers/lspController.js
const lspModel = require("../models/lspModel");

async function createLspHandler(request, reply) {
  try {
    const newLsp = await lspModel.createLsp(request.body);
    reply
      .status(201)
      .send({ message: "LSP created successfully", lsp: newLsp });
  } catch (error) {
    console.error("Error creating LSP:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllLspsHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const lsps = await lspModel.getAllLsps({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await lspModel.getTotalLsps(search);

    reply.send({
      message: "LSPs retrieved successfully",
      data: lsps,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all LSPs:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getLspByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const lsp = await lspModel.getLspById(id);
    if (!lsp) {
      return reply.status(404).send({ message: "LSP not found" });
    }
    reply.send({ message: "LSP retrieved successfully", lsp });
  } catch (error) {
    console.error("Error getting LSP by ID:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function updateLspHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedLsp = await lspModel.updateLsp(id, request.body);
    if (!updatedLsp) {
      return reply.status(404).send({ message: "LSP not found" });
    }
    reply.send({ message: "LSP updated successfully", lsp: updatedLsp });
  } catch (error) {
    console.error("Error updating LSP:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function deleteLspHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedLsp = await lspModel.deleteLsp(id);
    if (!deletedLsp) {
      return reply.status(404).send({ message: "LSP not found" });
    }
    reply.send({ message: "LSP deleted successfully", id: deletedLsp.id });
  } catch (error) {
    console.error("Error deleting LSP:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  createLspHandler,
  getAllLspsHandler,
  getLspByIdHandler,
  updateLspHandler,
  deleteLspHandler,
};
