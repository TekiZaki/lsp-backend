// server.js
require("dotenv").config();
const buildApp = require("./app");

const app = buildApp({ logger: true }); // Mengaktifkan logger Fastify
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await app.listen({ port });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
