// lsp-backend/modules/rekening/RekeningController.js
const rekeningModel = require("./RekeningModel");
const { mapToCamelCase, mapToSnakeCase } = require("../../utils/dataMapper");

async function getAllRekening(request, reply) {
  try {
    const data = await rekeningModel.findAll();
    reply.send(mapToCamelCase(data));
  } catch (error) {
    console.error("Error getting all rekening:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function createRekening(request, reply) {
  try {
    const newData = await rekeningModel.create(mapToSnakeCase(request.body));
    reply.status(201).send(mapToCamelCase(newData));
  } catch (error) {
    console.error("Error creating rekening:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateRekening(request, reply) {
  try {
    const { id } = request.params;
    const updatedData = await rekeningModel.update(
      id,
      mapToSnakeCase(request.body)
    );
    if (!updatedData) {
      return reply.status(404).send({ message: "Rekening not found" });
    }
    reply.send(mapToCamelCase(updatedData));
  } catch (error) {
    console.error("Error updating rekening:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteRekening(request, reply) {
  try {
    const { id } = request.params;
    const deletedData = await rekeningModel.remove(id);
    if (!deletedData) {
      return reply.status(404).send({ message: "Rekening not found" });
    }
    reply.send({
      message: "Rekening deleted successfully",
      deletedId: deletedData.id,
    });
  } catch (error) {
    console.error("Error deleting rekening:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  getAllRekening,
  createRekening,
  updateRekening,
  deleteRekening,
};
