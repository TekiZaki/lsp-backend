const Fastify = require("fastify");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lspRoutes = require("./routes/lspRoutes");
const tukRoutes = require("./routes/tukRoutes"); // Import baru
const eukRoutes = require("./routes/eukRoutes"); // Import baru
const schemeRoutes = require("./routes/schemeRoutes"); // Import baru
const cors = require("@fastify/cors");

function buildApp(opts = {}) {
  const fastify = Fastify(opts);

  // Register CORS
  fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Register routes
  fastify.register(authRoutes, { prefix: "/api/auth" });
  fastify.register(userRoutes, { prefix: "/api/users" });
  fastify.register(lspRoutes, { prefix: "/api/lsps" });
  fastify.register(tukRoutes, { prefix: "/api/tuks" }); // Rute TUK
  fastify.register(eukRoutes, { prefix: "/api/euks" }); // Rute EUK
  fastify.register(schemeRoutes, { prefix: "/api/schemes" }); // Rute Skema

  fastify.get("/", async (request, reply) => {
    return { message: "Welcome to LSP Backend API!" };
  });

  return fastify;
}

module.exports = buildApp;
