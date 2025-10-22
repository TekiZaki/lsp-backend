// server.js (UPDATED FOR NETWORK ACCESS)
require("dotenv").config();
const os = require("os");
const buildApp = require("./app");

const app = buildApp({ logger: true });
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const start = async () => {
  try {
    await app.listen({ port, host });
    console.log(`- Localhost:    http://localhost:${port}`);
    const networkIps = getNetworkIps();
    if (networkIps.length > 0) {
      console.log(`- On Your Network:`);
      networkIps.forEach((ip) => {
        console.log(`  - http://${ip}:${port}`);
      });
    }
    console.log("\nPress CTRL-C to stop the server");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
