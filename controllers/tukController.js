// controllers/tukController.js
const tukModel = require("../models/tukModel");

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

// ... (createTukHandler, getTukByIdHandler, updateTukHandler, deleteTukHandler)

module.exports = {
  getAllTuksHandler,
};
