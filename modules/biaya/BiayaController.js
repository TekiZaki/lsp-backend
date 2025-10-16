// lsp-backend/modules/biaya/BiayaController.js
const biayaModel = require("./BiayaModel");
const { mapToCamelCase, mapToSnakeCase } = require("../../utils/dataMapper");

async function getAllBiaya(request, reply) {
  try {
    const data = await biayaModel.findAll();
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting all biaya:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getBiayaById(request, reply) {
  try {
    const { id } = request.params;
    const data = await biayaModel.findById(id);
    if (!data) {
      return reply.status(404).send({ message: "Biaya not found" });
    }
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting biaya by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function createBiaya(request, reply) {
  try {
    const newData = await biayaModel.create(mapToSnakeCase(request.body));
    reply.status(201).send(mapToCamelCase(newData));
  } catch (error) {
    console.error("Error creating biaya:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateBiaya(request, reply) {
  try {
    const { id } = request.params;
    const updatedData = await biayaModel.update(
      id,
      mapToSnakeCase(request.body)
    );
    if (!updatedData) {
      return reply.status(404).send({ message: "Biaya not found" });
    }
    reply.send(mapToCamelCase(updatedData));
  } catch (error) {
    console.error("Error updating biaya:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteBiaya(request, reply) {
  try {
    const { id } = request.params;
    const deletedData = await biayaModel.remove(id);
    if (!deletedData) {
      return reply.status(404).send({ message: "Biaya not found" });
    }
    reply.send({
      message: "Biaya deleted successfully",
      deletedId: deletedData.id,
    });
  } catch (error) {
    console.error("Error deleting biaya:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  getAllBiaya,
  getBiayaById,
  createBiaya,
  updateBiaya,
  deleteBiaya,
};
