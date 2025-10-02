// lsp-backend/modules/euk/EventUjiKompetensiController.js
const eukModel = require("./EventUjiKompetensiModel");

async function createEukHandler(request, reply) {
  try {
    // request.body sudah dalam format camelCase (namaKegiatan, tanggal, dll.)
    const newEuk = await eukModel.createEuk(request.body);
    reply
      .status(201)
      .send({ message: "EUK created successfully", data: newEuk });
  } catch (error) {
    console.error("Error creating EUK:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllEuksHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const euks = await eukModel.getAllEuks({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await eukModel.getTotalEuks(search);

    reply.send({
      message: "EUKs retrieved successfully",
      data: euks,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all EUKs:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getEukByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const euk = await eukModel.getEukById(id);
    if (!euk) {
      return reply.status(404).send({ message: "EUK not found" });
    }
    reply.send({ message: "EUK retrieved successfully", data: euk });
  } catch (error) {
    console.error("Error getting EUK by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateEukHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedEuk = await eukModel.updateEuk(id, request.body);
    if (!updatedEuk) {
      return reply.status(404).send({ message: "EUK not found" });
    }
    reply.send({ message: "EUK updated successfully", data: updatedEuk });
  } catch (error) {
    console.error("Error updating EUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteEukHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedEuk = await eukModel.deleteEuk(id);
    if (!deletedEuk) {
      return reply.status(404).send({ message: "EUK not found" });
    }
    reply.send({ message: "EUK deleted successfully", id: deletedEuk.id });
  } catch (error) {
    console.error("Error deleting EUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createEukHandler,
  getAllEuksHandler,
  getEukByIdHandler,
  updateEukHandler,
  deleteEukHandler,
};
