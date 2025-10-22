// middlewares/authMiddleware.js
const { verifyToken } = require("../utils/jwt");

const authenticate = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .status(401)
        .send({ message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return reply.status(401).send({ message: "Invalid or expired token" });
    }

    // Simpan data user yang terautentikasi ke objek request
    request.user = decoded;
  } catch (error) {
    console.error("Authentication error:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

module.exports = authenticate;
