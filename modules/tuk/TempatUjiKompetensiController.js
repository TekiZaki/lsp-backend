// lsp-backend/modules/tuk/TempatUjiKompetensiController.js
const tukModel = require("./TempatUjiKompetensiModel");

async function createTukHandler(request, reply) {
  try {
    const newTuk = await tukModel.createTuk(request.body);
    reply
      .status(201)
      .send({ message: "TUK created successfully", data: newTuk });
  } catch (error) {
    console.error("Error creating TUK:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllTuksHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const tuks = await tukModel.getAllTuks({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await tukModel.getTotalTuks(search);

    reply.send({
      message: "TUKs retrieved successfully",
      data: tuks,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all TUKs:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getTukByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const tuk = await tukModel.getTukById(id);
    if (!tuk) {
      return reply.status(404).send({ message: "TUK not found" });
    }
    reply.send({ message: "TUK retrieved successfully", data: tuk });
  } catch (error) {
    console.error("Error getting TUK by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateTukHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedTuk = await tukModel.updateTuk(id, request.body);
    if (!updatedTuk) {
      return reply.status(404).send({ message: "TUK not found" });
    }
    reply.send({ message: "TUK updated successfully", data: updatedTuk });
  } catch (error) {
    console.error("Error updating TUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteTukHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedTuk = await tukModel.deleteTuk(id);
    if (!deletedTuk) {
      return reply.status(404).send({ message: "TUK not found" });
    }
    reply.send({ message: "TUK deleted successfully", id: deletedTuk.id });
  } catch (error) {
    console.error("Error deleting TUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createTukHandler,
  getAllTuksHandler,
  getTukByIdHandler,
  updateTukHandler,
  deleteTukHandler,
};
