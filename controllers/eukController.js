// controllers/eukController.js
const eukModel = require("../models/eukModel");

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

// ... (createEukHandler, getEukByIdHandler, updateEukHandler, deleteEukHandler)

module.exports = {
  getAllEuksHandler,
};
