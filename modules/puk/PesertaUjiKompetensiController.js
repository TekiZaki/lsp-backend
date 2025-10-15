// lsp-backend/modules/puk/PesertaUjiKompetensiController.js
const pukModel = require("./PesertaUjiKompetensiModel");

async function getPesertaByJadwalId(request, reply) {
  try {
    const { jadwalId } = request.params;
    const peserta = await pukModel.findPesertaByJadwalId(jadwalId);
    if (!peserta || peserta.length === 0) {
      return reply
        .status(404)
        .send({ message: "No peserta found for this jadwal ID" });
    }
    reply.send({ message: "Peserta retrieved successfully", data: peserta });
  } catch (error) {
    console.error("Error getting peserta by jadwal ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function addPesertaToJadwal(request, reply) {
  try {
    const { jadwalId } = request.params;
    const { asesiId } = request.body; // Assuming asesiId is passed in the request body

    if (!asesiId) {
      return reply.status(400).send({ message: "Asesi ID is required" });
    }

    const newPeserta = await pukModel.addPeserta(jadwalId, asesiId);
    reply.status(201).send({
      message: "Peserta added to jadwal successfully",
      data: newPeserta,
    });
  } catch (error) {
    console.error("Error adding peserta to jadwal:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function removePesertaFromJadwal(request, reply) {
  try {
    const { jadwalId, pesertaId } = request.params;
    const deletedPeserta = await pukModel.removePeserta(jadwalId, pesertaId);
    if (!deletedPeserta) {
      return reply
        .status(404)
        .send({ message: "Peserta not found in this jadwal" });
    }
    reply.send({
      message: "Peserta removed from jadwal successfully",
      id: deletedPeserta.id,
    });
  } catch (error) {
    console.error("Error removing peserta from jadwal:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  getPesertaByJadwalId,
  addPesertaToJadwal,
  removePesertaFromJadwal,
};
