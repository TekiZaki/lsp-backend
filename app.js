// app.js
const Fastify = require("fastify");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lspRoutes = require("./routes/lspRoutes"); // Import rute LSP

function buildApp(opts = {}) {
  const fastify = Fastify(opts);

  // Register routes
  fastify.register(authRoutes, { prefix: "/api/auth" }); // Ganti prefix ke /api/auth
  fastify.register(userRoutes, { prefix: "/api/users" }); // Ganti prefix ke /api/users
  fastify.register(lspRoutes, { prefix: "/api/lsps" }); // Register rute LSP dengan prefix /api/lsps

  fastify.get("/", async (request, reply) => {
    return { message: "Welcome to LSP Backend API!" };
  });

  return fastify;
}

module.exports = buildApp;
