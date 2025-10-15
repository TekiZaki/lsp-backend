// lsp-backend/modules/juk/JadwalUjiKompetensiController.js
const jukModel = require("./JadwalUjiKompetensiModel");

async function createJukHandler(request, reply) {
  try {
    const newJuk = await jukModel.createJuk(request.body);
    reply.status(201).send({
      message: "Jadwal Uji Kompetensi created successfully",
      data: newJuk,
    });
  } catch (error) {
    console.error("Error creating JUK:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllJuksHandler(request, reply) {
  try {
    // Kita anggap JUK adalah daftar Events yang sudah ditetapkan TUK dan Asesornya
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const juks = await jukModel.getAllJuks({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await jukModel.getTotalJuks(search);

    reply.send({
      message: "JUKs retrieved successfully",
      data: juks,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all JUKs:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getJukByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const juk = await jukModel.getJukById(id);
    if (!juk) {
      return reply
        .status(404)
        .send({ message: "Jadwal Uji Kompetensi not found" });
    }
    reply.send({ message: "JUK retrieved successfully", data: juk });
  } catch (error) {
    console.error("Error getting JUK by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateJukHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedJuk = await jukModel.updateJuk(id, request.body);
    if (!updatedJuk) {
      return reply
        .status(404)
        .send({ message: "Jadwal Uji Kompetensi not found" });
    }
    reply.send({ message: "JUK updated successfully", data: updatedJuk });
  } catch (error) {
    console.error("Error updating JUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteJukHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedJuk = await jukModel.deleteJuk(id);
    if (!deletedJuk) {
      return reply
        .status(404)
        .send({ message: "Jadwal Uji Kompetensi not found" });
    }
    reply.send({ message: "JUK deleted successfully", id: deletedJuk.id });
  } catch (error) {
    console.error("Error deleting JUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createJukHandler,
  getAllJuksHandler,
  getJukByIdHandler,
  updateJukHandler,
  deleteJukHandler,
};
