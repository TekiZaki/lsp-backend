const Fastify = require("fastify");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lspRoutes = require("./routes/lspRoutes");
const cors = require("@fastify/cors");

function buildApp(opts = {}) {
  const fastify = Fastify(opts);

  // Register CORS - *Pastikan ini di awal sebelum rute lain*
  fastify.register(cors, {
    origin: "*", // Ganti dengan 'http://localhost:8080' atau domain frontend Anda di produksi
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Tambahkan PATCH jika digunakan
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Register routes
  fastify.register(authRoutes, { prefix: "/api/auth" });
  fastify.register(userRoutes, { prefix: "/api/users" });
  fastify.register(lspRoutes, { prefix: "/api/lsps" });

  fastify.get("/", async (request, reply) => {
    return { message: "Welcome to LSP Backend API!" };
  });

  return fastify;
}

module.exports = buildApp;
