// controllers/schemeController.js
const schemeModel = require("../models/schemeModel");

async function getAllSchemesHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const schemes = await schemeModel.getAllSchemes({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await schemeModel.getTotalSchemes(search);

    reply.send({
      message: "Schemes retrieved successfully",
      data: schemes,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all Schemes:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// ... (createSchemeHandler, getSchemeByIdHandler, updateSchemeHandler, deleteSchemeHandler)

module.exports = {
  getAllSchemesHandler,
};
