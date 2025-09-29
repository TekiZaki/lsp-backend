# Code Dump for lsp-backend

## lsp-backend/app.js

```js
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
```

## lsp-backend/server.js

```js
// server.js
require("dotenv").config();
const buildApp = require("./app");

const app = buildApp({ logger: true });
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
```

## lsp-backend/config/database.js

```js
// config/database.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
```

## lsp-backend/config/jwt.js

```js
// config/jwt.js
require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
};
```

## lsp-backend/controllers/authController.js

```js
// controllers/authController.js
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const userModel = require("../models/userModel");

async function register(request, reply) {
  try {
    const { username, password, email, role_name } = request.body;

    if (!username || !password || !email || !role_name) {
      return reply.status(400).send({ message: "All fields are required" });
    }

    // Cek apakah username sudah ada
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return reply.status(409).send({ message: "Username already taken" });
    }

    // Dapatkan role_id berdasarkan role_name
    const role = await userModel.getRoleByName(role_name);
    if (!role) {
      return reply.status(400).send({ message: "Invalid role name" });
    }
    const role_id = role.id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await userModel.createUser({
      username,
      password: hashedPassword,
      email,
      role_id,
    });

    reply.status(201).send({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function login(request, reply) {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply
        .status(400)
        .send({ message: "Username and password are required" });
    }

    // Cari user berdasarkan username
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
    });

    reply.send({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
};
```

## lsp-backend/controllers/lspController.js

```js
// controllers/lspController.js
const lspModel = require("../models/lspModel");

async function createLspHandler(request, reply) {
  try {
    const newLsp = await lspModel.createLsp(request.body);
    reply
      .status(201)
      .send({ message: "LSP created successfully", lsp: newLsp });
  } catch (error) {
    console.error("Error creating LSP:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllLspsHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const lsps = await lspModel.getAllLsps({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await lspModel.getTotalLsps(search);

    reply.send({
      message: "LSPs retrieved successfully",
      data: lsps,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all LSPs:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getLspByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const lsp = await lspModel.getLspById(id);
    if (!lsp) {
      return reply.status(404).send({ message: "LSP not found" });
    }
    reply.send({ message: "LSP retrieved successfully", lsp });
  } catch (error) {
    console.error("Error getting LSP by ID:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function updateLspHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedLsp = await lspModel.updateLsp(id, request.body);
    if (!updatedLsp) {
      return reply.status(404).send({ message: "LSP not found" });
    }
    reply.send({ message: "LSP updated successfully", lsp: updatedLsp });
  } catch (error) {
    console.error("Error updating LSP:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function deleteLspHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedLsp = await lspModel.deleteLsp(id);
    if (!deletedLsp) {
      return reply.status(404).send({ message: "LSP not found" });
    }
    reply.send({ message: "LSP deleted successfully", id: deletedLsp.id });
  } catch (error) {
    console.error("Error deleting LSP:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  createLspHandler,
  getAllLspsHandler,
  getLspByIdHandler,
  updateLspHandler,
  deleteLspHandler,
};
```

## lsp-backend/controllers/userController.js

```js
// controllers/userController.js
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs"); // Perlu untuk mengganti password

async function getMyProfile(request, reply) {
  try {
    // Data user berasal dari token yang didecode oleh middleware autentikasi
    const userId = request.user.id;
    // Kita bisa ambil data user lengkap dari model
    const user = await userModel.findUserById(userId);

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    reply.send({ message: "User profile retrieved successfully", user });
  } catch (error) {
    console.error("Error getting user profile:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function changePassword(request, reply) {
  try {
    const userId = request.user.id;
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return reply
        .status(400)
        .send({ message: "Current password and new password are required" });
    }

    // Ambil user dari database untuk memverifikasi password lama
    // Gunakan findUserById tapi ambil juga password-nya, atau buat fungsi khusus
    // Untuk saat ini, kita bisa modifikasi findUserById atau buat fungsi baru di model
    const userWithPassword = await userModel.findUserByUsername(
      request.user.username
    ); // Ambil user lengkap termasuk password
    if (!userWithPassword || userWithPassword.id !== userId) {
      // Pastikan user adalah user yang login
      return reply.status(404).send({ message: "User not found or mismatch" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );
    if (!isMatch) {
      return reply.status(401).send({ message: "Incorrect current password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    await userModel.updateUserPassword(userId, hashedPassword);

    reply.send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

// Hanya ekspor fungsi-fungsi controller
module.exports = {
  getMyProfile,
  changePassword,
};
```

## lsp-backend/middlewares/authMiddleware.js

```js
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
    // Fastify tidak secara otomatis memiliki `request.user`, jadi kita bisa menambahkannya
    request.user = decoded;
  } catch (error) {
    console.error("Authentication error:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

module.exports = authenticate;
```

## lsp-backend/middlewares/authorizeMiddleware.js

```js
// middlewares/authorizeMiddleware.js
const userModel = require("../models/userModel"); // Perlu untuk mendapatkan nama peran

const authorize =
  (roles = []) =>
  async (request, reply) => {
    if (typeof roles === "string") {
      roles = [roles];
    }

    if (!request.user || !request.user.role_id) {
      return reply
        .status(403)
        .send({ message: "Access denied. No role information." });
    }

    try {
      // Dapatkan nama peran dari ID peran
      const roleQueryResult = await userModel.getRoleById(request.user.role_id);
      if (!roleQueryResult || !roleQueryResult.name) {
        return reply
          .status(403)
          .send({ message: "Access denied. Invalid role." });
      }
      const userRoleName = roleQueryResult.name;

      // Periksa apakah peran pengguna termasuk dalam peran yang diizinkan
      if (roles.length && !roles.includes(userRoleName)) {
        return reply.status(403).send({
          message: "Access denied. You do not have the required role.",
        });
      }
    } catch (error) {
      console.error("Authorization error:", error);
      return reply
        .status(500)
        .send({ message: "Internal server error during authorization" });
    }
  };

module.exports = authorize;
```

## lsp-backend/models/lspModel.js

```js
// models/lspModel.js
const { query } = require("../utils/db");

async function createLsp(lspData) {
  const {
    kode_lsp,
    nama_lsp,
    jenis_lsp,
    direktur_lsp,
    manajer_lsp,
    institusi_induk,
    skkni,
    telepon,
    faximile,
    whatsapp,
    alamat_email,
    website,
    alamat,
    desa,
    kecamatan,
    kota,
    provinsi,
    kode_pos,
    nomor_lisensi,
    masa_berlaku,
  } = lspData;

  const res = await query(
    `INSERT INTO lsp_institutions (
            kode_lsp, nama_lsp, jenis_lsp, direktur_lsp, manajer_lsp, institusi_induk, skkni,
            telepon, faximile, whatsapp, alamat_email, website,
            alamat, desa, kecamatan, kota, provinsi, kode_pos,
            nomor_lisensi, masa_berlaku
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *`,
    [
      kode_lsp,
      nama_lsp,
      jenis_lsp,
      direktur_lsp,
      manajer_lsp,
      institusi_induk,
      skkni,
      telepon,
      faximile,
      whatsapp,
      alamat_email,
      website,
      alamat,
      desa,
      kecamatan,
      kota,
      provinsi,
      kode_pos,
      nomor_lisensi,
      masa_berlaku,
    ]
  );
  return res.rows[0];
}

async function getAllLsps({ search, limit, offset }) {
  let queryText = "SELECT * FROM lsp_institutions";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(nama_lsp) LIKE $1 OR LOWER(direktur_lsp) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY created_at DESC";

  if (limit) {
    queryParams.push(limit);
    queryText += ` LIMIT $${queryParams.length}`;
  }
  if (offset) {
    queryParams.push(offset);
    queryText += ` OFFSET $${queryParams.length}`;
  }

  const res = await query(queryText, queryParams);
  return res.rows;
}

async function getLspById(id) {
  const res = await query("SELECT * FROM lsp_institutions WHERE id = $1", [id]);
  return res.rows[0];
}

async function updateLsp(id, lspData) {
  const {
    kode_lsp,
    nama_lsp,
    jenis_lsp,
    direktur_lsp,
    manajer_lsp,
    institusi_induk,
    skkni,
    telepon,
    faximile,
    whatsapp,
    alamat_email,
    website,
    alamat,
    desa,
    kecamatan,
    kota,
    provinsi,
    kode_pos,
    nomor_lisensi,
    masa_berlaku,
  } = lspData;

  const res = await query(
    `UPDATE lsp_institutions SET
            kode_lsp = $1, nama_lsp = $2, jenis_lsp = $3, direktur_lsp = $4, manajer_lsp = $5, institusi_induk = $6, skkni = $7,
            telepon = $8, faximile = $9, whatsapp = $10, alamat_email = $11, website = $12,
            alamat = $13, desa = $14, kecamatan = $15, kota = $16, provinsi = $17, kode_pos = $18,
            nomor_lisensi = $19, masa_berlaku = $20, updated_at = CURRENT_TIMESTAMP
        WHERE id = $21
        RETURNING *`,
    [
      kode_lsp,
      nama_lsp,
      jenis_lsp,
      direktur_lsp,
      manajer_lsp,
      institusi_induk,
      skkni,
      telepon,
      faximile,
      whatsapp,
      alamat_email,
      website,
      alamat,
      desa,
      kecamatan,
      kota,
      provinsi,
      kode_pos,
      nomor_lisensi,
      masa_berlaku,
      id,
    ]
  );
  return res.rows[0];
}

async function deleteLsp(id) {
  const res = await query(
    "DELETE FROM lsp_institutions WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0];
}

// Tambahkan fungsi untuk menghitung total data LSP (untuk paginasi frontend)
async function getTotalLsps(search) {
  let queryText = "SELECT COUNT(*) FROM lsp_institutions";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(nama_lsp) LIKE $1 OR LOWER(direktur_lsp) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

module.exports = {
  createLsp,
  getAllLsps,
  getLspById,
  updateLsp,
  deleteLsp,
  getTotalLsps,
};
```

## lsp-backend/models/userModel.js

```js
// models/userModel.js
const { query } = require("../utils/db");
const bcrypt = require("bcryptjs"); // Tambahkan ini karena updateUserPassword akan membutuhkannya untuk hash password baru

async function createUser(userData) {
  const { username, password, email, role_id } = userData;
  const res = await query(
    "INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id",
    [username, password, email, role_id]
  );
  return res.rows[0];
}

async function findUserByUsername(username) {
  // Kita mungkin butuh password untuk verifikasi login, jadi SELECT *
  const res = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return res.rows[0];
}

async function findUserById(id) {
  // Untuk profil, kita tidak perlu mengembalikan password
  const res = await query(
    "SELECT id, username, email, role_id FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0];
}

async function getRoleByName(roleName) {
  const res = await query("SELECT id FROM roles WHERE name = $1", [roleName]);
  return res.rows[0];
}

async function updateUserPassword(userId, hashedPassword) {
  const res = await query(
    "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id",
    [hashedPassword, userId]
  );
  return res.rows[0];
}

async function getRoleById(roleId) {
  const res = await query("SELECT name FROM roles WHERE id = $1", [roleId]);
  return res.rows[0];
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  getRoleByName,
  updateUserPassword,
  getRoleById, // Export the new function
};
```

## lsp-backend/routes/authRoutes.js

```js
// routes/authRoutes.js
const authController = require("../controllers/authController");

async function authRoutes(fastify, options) {
  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
}

module.exports = authRoutes;
```

## lsp-backend/routes/lspRoutes.js

```js
// routes/lspRoutes.js
const lspController = require("../controllers/lspController");
const authenticate = require("../middlewares/authMiddleware"); // Untuk melindungi rute
const authorize = require("../middlewares/authorizeMiddleware"); // Middleware baru untuk otorisasi

async function lspRoutes(fastify, options) {
  // Memerlukan autentikasi untuk semua operasi LSP
  // Dan mungkin otorisasi (misal: hanya Admin yang bisa CRUD LSP)

  // GET /api/lsps - Dapatkan semua LSP (bisa diakses publik atau hanya user terautentikasi)
  fastify.get(
    "/",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getAllLspsHandler
  );
  // GET /api/lsps/:id - Dapatkan LSP berdasarkan ID
  fastify.get(
    "/:id",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getLspByIdHandler
  );

  // POST /api/lsps - Buat LSP baru (Hanya Admin)
  fastify.post(
    "/",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.createLspHandler
  );
  // PUT /api/lsps/:id - Perbarui LSP (Hanya Admin)
  fastify.put(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.updateLspHandler
  );
  // DELETE /api/lsps/:id - Hapus LSP (Hanya Admin)
  fastify.delete(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.deleteLspHandler
  );
}

module.exports = lspRoutes;
```

## lsp-backend/routes/userRoutes.js

```js
// routes/userRoutes.js
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");

async function userRoutes(fastify, options) {
  // Rute yang membutuhkan autentikasi
  fastify.get(
    "/profile",
    { preHandler: [authenticate] },
    userController.getMyProfile
  );
  fastify.post(
    "/change-password",
    { preHandler: [authenticate] },
    userController.changePassword
  );
  // ... rute user lain yang dilindungi
}

module.exports = userRoutes;
```

## lsp-backend/utils/db.js

```js
// utils/db.js
const pool = require("../config/database");

async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  pool, // Ekspor pool juga jika dibutuhkan langsung di tempat lain (misalnya untuk transaksi)
};
```

## lsp-backend/utils/jwt.js

```js
// utils/jwt.js
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    return null; // Token tidak valid atau expired
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
```
