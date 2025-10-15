// lsp-backend/app.js (FINAL UPDATED)
const Fastify = require("fastify");
const cors = require("@fastify/cors");

// Impor Routes Modul (Feature-Based)
const authRoutes = require("./modules/auth/authRoutes");
const userRoutes = require("./modules/user/userRoutes");
const lspRoutes = require("./modules/lsp/LembagaSertifikasiProfesiRoutes");
const eukRoutes = require("./modules/euk/EventUjiKompetensiRoutes");
const tukRoutes = require("./modules/tuk/TempatUjiKompetensiRoutes");
const schemeRoutes = require("./modules/scheme/SkemaSertifikasiRoutes");
const jukRoutes = require("./modules/juk/JadwalUjiKompetensiRoutes");
const ukRoutes = require("./modules/uk/UnitKompetensiRoutes");
const asesiRoutes = require("./modules/asesi/asesiRoutes"); // NEW: Impor rute asesi

function buildApp(opts = {}) {
  const fastify = Fastify(opts);

  // Register CORS
  fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // --- Register Feature Modules ---
  fastify.register(authRoutes, { prefix: "/api/auth" });
  fastify.register(userRoutes, { prefix: "/api/users" });
  fastify.register(lspRoutes, { prefix: "/api/lsps" });
  fastify.register(eukRoutes, { prefix: "/api/euks" });
  fastify.register(tukRoutes, { prefix: "/api/tuks" });
  fastify.register(schemeRoutes, { prefix: "/api/schemes" });
  fastify.register(jukRoutes, { prefix: "/api/juks" });
  fastify.register(ukRoutes, { prefix: "/api/units" });
  fastify.register(asesiRoutes, { prefix: "/api/asesi" }); // NEW: Daftarkan rute asesi

  fastify.get("/", async (request, reply) => {
    return { message: "Welcome to LSP Backend API!" };
  });

  return fastify;
}

module.exports = buildApp;
