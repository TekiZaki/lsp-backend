// app.js
const Fastify = require("fastify");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
// Import routes untuk fitur-fitur lain yang akan dibuat

function buildApp(opts = {}) {
  const fastify = Fastify(opts);

  // Register routes
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(userRoutes, { prefix: "/users" });
  // Daftarkan rute-rute lain di sini

  fastify.get("/", async (request, reply) => {
    return { message: "Welcome to LSP Backend API!" };
  });

  return fastify;
}

module.exports = buildApp;
