// lsp-backend/modules/uk/UnitKompetensiController.js
const ukModel = require("./UnitKompetensiModel");

// --- CRUD Unit Kompetensi Level Utama ---

async function createUnitHandler(request, reply) {
  try {
    const newUnit = await ukModel.createUnit(request.body);
    reply
      .status(201)
      .send({ message: "Unit Kompetensi created successfully", data: newUnit });
  } catch (error) {
    console.error("Error creating Unit Kompetensi:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllUnitsHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10, schemeId } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const units = await ukModel.getAllUnits({
      search,
      limit: parseInt(limit),
      offset,
      schemeId,
    });
    const total = await ukModel.getTotalUnits(search, schemeId);

    reply.send({
      message: "Units retrieved successfully",
      data: units,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all Units:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getUnitDetailHandler(request, reply) {
  try {
    const { id } = request.params;
    const unit = await ukModel.getUnitDetail(id);
    if (!unit) {
      return reply.status(404).send({ message: "Unit Kompetensi not found" });
    }
    reply.send({ message: "Unit detail retrieved successfully", data: unit });
  } catch (error) {
    console.error("Error getting Unit detail:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// --- CRUD Nested (Elemen & KUK) ---

async function createElemenHandler(request, reply) {
  try {
    const { unitId } = request.params;
    const { namaElemen } = request.body;

    if (!namaElemen) {
      return reply.status(400).send({ message: "namaElemen is required" });
    }

    const newElemen = await ukModel.createElemen(unitId, namaElemen);
    reply.status(201).send({
      message: "Elemen Kompetensi created successfully",
      data: newElemen,
    });
  } catch (error) {
    console.error("Error creating Elemen:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function createKukHandler(request, reply) {
  try {
    const { elemenId } = request.params;
    const { deskripsi } = request.body;

    if (!deskripsi) {
      return reply.status(400).send({ message: "deskripsi is required" });
    }

    const newKuk = await ukModel.createKuk(elemenId, deskripsi);
    reply.status(201).send({
      message: "Kriteria Unjuk Kerja created successfully",
      data: newKuk,
    });
  } catch (error) {
    console.error("Error creating KUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createUnitHandler,
  getAllUnitsHandler,
  getUnitDetailHandler,
  createElemenHandler,
  createKukHandler,
};
