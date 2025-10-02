# Code Dump for lsp-backend

## lsp-backend/app.js

```js
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

## lsp-backend/sql.sql

```sql
-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Asesi Profiles
CREATE TABLE asesi_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    ktp_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. LSP Institutions
CREATE TABLE lsp_institutions (
    id SERIAL PRIMARY KEY,
    nama_lsp VARCHAR(150) NOT NULL,
    direktur_lsp VARCHAR(100),
    jenis_lsp VARCHAR(50),
    alamat TEXT,
    telepon VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tempat Uji Kompetensi (TUK)
CREATE TABLE tempat_uji_kompetensi (
    id SERIAL PRIMARY KEY,
    kode_tuk VARCHAR(50) UNIQUE NOT NULL,
    nama_tempat VARCHAR(150) NOT NULL,
    jenis_tuk VARCHAR(50),
    penanggung_jawab VARCHAR(100),
    lisensi_info TEXT,
    skkni_info TEXT,
    jadwal_info TEXT,
    lsp_induk_id INT REFERENCES lsp_institutions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Certification Schemes
CREATE TABLE certification_schemes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    skkni TEXT,
    keterangan_bukti TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Events (EUK - Event Uji Kompetensi)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    registration_deadline DATE,
    location VARCHAR(150),
    address TEXT,
    max_participants INT,
    penanggung_jawab VARCHAR(100),
    lsp_penyelenggara VARCHAR(150),
    description TEXT,
    status VARCHAR(50),
    scheme_id INT REFERENCES certification_schemes(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Default Roles
INSERT INTO roles (name) VALUES
('Admin'),
('Asesi'),
('Asesor');

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
// lsp-backend/middlewares/authorizeMiddleware.js
// Menggunakan GlobalModel untuk mendapatkan data role
const globalModel = require("../models/globalModel");

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
      // Dapatkan nama peran dari ID peran melalui GlobalModel
      const roleQueryResult = await globalModel.getRoleById(
        request.user.role_id
      );
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

## lsp-backend/models/globalModel.js

```js
// lsp-backend/models/globalModel.js
const { query } = require("../utils/db");

// Fungsi umum untuk mendapatkan Role
async function getRoleByName(name) {
  const res = await query("SELECT id, name FROM roles WHERE name = $1", [name]);
  return res.rows[0];
}

async function getRoleById(id) {
  const res = await query("SELECT id, name FROM roles WHERE id = $1", [id]);
  return res.rows[0];
}

module.exports = {
  getRoleByName,
  getRoleById,
};
```

## lsp-backend/modules/auth/authController.js

```js
// lsp-backend/modules/auth/authController.js
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/jwt");
const authModel = require("./authModel");
const globalModel = require("../../models/globalModel"); // Impor Global Model
const { getClient } = require("../../utils/db");

async function register(request, reply) {
  const client = await getClient();
  try {
    const {
      username,
      password,
      email,
      full_name,
      ktp_number,
      phone_number,
      address,
    } = request.body;

    const role_name = "Asesi";

    if (!username || !password || !email || !full_name || !ktp_number) {
      return reply.status(400).send({ message: "Required fields are missing" });
    }

    await client.query("BEGIN");

    // 1. Cek username
    const existingUser = await authModel.findUserByUsername(username);
    if (existingUser) {
      await client.query("ROLLBACK");
      return reply
        .status(409)
        .send({ message: "Username (NPP) already taken" });
    }

    // 2. Dapatkan role_id 'Asesi' dari GlobalModel
    const role = await globalModel.getRoleByName(role_name);
    if (!role) {
      await client.query("ROLLBACK");
      return reply.status(400).send({ message: "Role 'Asesi' not found" });
    }
    const role_id = role.id;

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat user baru (Tabel users)
    const newUser = await authModel.createUser(
      client,
      username,
      hashedPassword,
      email,
      role_id
    );

    // 5. Buat profil Asesi (Tabel asesi_profiles)
    await authModel.createAsesiProfile(client, newUser.id, {
      full_name,
      phone_number,
      address,
      ktp_number,
    });

    await client.query("COMMIT");

    reply.status(201).send({
      message: "Asesi registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during Asesi registration:", error);
    reply.status(500).send({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

async function login(request, reply) {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply
        .status(400)
        .send({ message: "Username (NPP) and password are required" });
    }

    const user = await authModel.findUserByUsername(username);
    if (!user) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

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

async function forgotPassword(request, reply) {
  // Logika Forgot Password tidak berubah
  try {
    const { npp, ktp_number, email } = request.body;

    if (!npp || !ktp_number || !email) {
      return reply.status(400).send({ message: "All fields are required" });
    }

    const user = await authModel.findUserByUsername(npp);
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    reply.send({
      message:
        "Jika data ditemukan, link reset password telah dikirimkan ke email Anda.",
    });
  } catch (error) {
    console.error("Error during forgot password process:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
};
```

## lsp-backend/modules/auth/authModel.js

```js
// lsp-backend/modules/auth/authModel.js
const { query } = require("../../utils/db");

async function findUserByUsername(username) {
  const res = await query(
    "SELECT id, username, password, email, role_id FROM users WHERE username = $1",
    [username]
  );
  return res.rows[0];
}

async function createUser(client, username, hashedPassword, email, role_id) {
  const res = await client.query(
    "INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id",
    [username, hashedPassword, email, role_id]
  );
  return res.rows[0];
}

async function createAsesiProfile(client, userId, profileData) {
  const { full_name, phone_number, address, ktp_number } = profileData;

  const res = await client.query(
    `INSERT INTO asesi_profiles (
        user_id, full_name, phone_number, address, ktp_number
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [userId, full_name, phone_number, address, ktp_number]
  );
  return res.rows[0];
}

module.exports = {
  findUserByUsername,
  createUser,
  createAsesiProfile,
};
```

## lsp-backend/modules/auth/authRoutes.js

```js
// lsp-backend/modules/auth/authRoutes.js
const authController = require("./authController");

async function authRoutes(fastify, options) {
  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
  fastify.post("/forgot-password", authController.forgotPassword);
}

module.exports = authRoutes;
```

## lsp-backend/modules/euk/EventUjiKompetensiController.js

```js
// lsp-backend/modules/euk/EventUjiKompetensiController.js
const eukModel = require("./EventUjiKompetensiModel");

async function createEukHandler(request, reply) {
  try {
    // request.body sudah dalam format camelCase (namaKegiatan, tanggal, dll.)
    const newEuk = await eukModel.createEuk(request.body);
    reply
      .status(201)
      .send({ message: "EUK created successfully", data: newEuk });
  } catch (error) {
    console.error("Error creating EUK:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllEuksHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const euks = await eukModel.getAllEuks({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await eukModel.getTotalEuks(search);

    reply.send({
      message: "EUKs retrieved successfully",
      data: euks,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all EUKs:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getEukByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const euk = await eukModel.getEukById(id);
    if (!euk) {
      return reply.status(404).send({ message: "EUK not found" });
    }
    reply.send({ message: "EUK retrieved successfully", data: euk });
  } catch (error) {
    console.error("Error getting EUK by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateEukHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedEuk = await eukModel.updateEuk(id, request.body);
    if (!updatedEuk) {
      return reply.status(404).send({ message: "EUK not found" });
    }
    reply.send({ message: "EUK updated successfully", data: updatedEuk });
  } catch (error) {
    console.error("Error updating EUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteEukHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedEuk = await eukModel.deleteEuk(id);
    if (!deletedEuk) {
      return reply.status(404).send({ message: "EUK not found" });
    }
    reply.send({ message: "EUK deleted successfully", id: deletedEuk.id });
  } catch (error) {
    console.error("Error deleting EUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createEukHandler,
  getAllEuksHandler,
  getEukByIdHandler,
  updateEukHandler,
  deleteEukHandler,
};
```

## lsp-backend/modules/euk/EventUjiKompetensiModel.js

```js
// lsp-backend/modules/euk/EventUjiKompetensiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper"); // Hanya butuh untuk output konversi

// Custom mapping untuk input dari frontend/API (camelCase non-standar) ke DB (snake_case)
const mapEukInputToDb = (input) => {
  // Asumsi: input menggunakan camelCase dari frontend
  const dbData = {
    event_name: input.namaKegiatan,
    start_date: input.tanggal,
    end_date: input.tanggal, // Asumsi tanggal selesai sama dengan tanggal mulai jika tidak diberikan
    registration_deadline: input.tanggal, // Asumsi deadline sama dengan tanggal mulai
    location: input.tempat,
    address: input.alamat, // Asumsi kolom 'address' ada di tabel events
    max_participants: input.jumlahPeserta,
    penanggung_jawab: input.penanggungJawab,
    lsp_penyelenggara: input.lspPenyelenggara,
    description: input.deskripsi,
    status: input.status,
    scheme_id: input.schemeId, // Diperlukan, asumsi dikirim
  };

  // Hapus key yang undefined
  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );

  return dbData;
};

// Custom mapping untuk output dari DB (snake_case) ke API (camelCase/non-standar)
const mapEukOutputToApi = (dbObject) => {
  if (!dbObject) return null;

  // Gunakan mapToCamelCase untuk semua kolom standar
  const camelCaseData = mapToCamelCase(dbObject);

  // Sesuaikan kembali nama field yang non-standar
  return {
    id: camelCaseData.id,
    namaKegiatan: camelCaseData.eventName,
    tanggal: camelCaseData.startDate,
    tempat: camelCaseData.location,
    alamat: camelCaseData.address,
    jumlahPeserta: camelCaseData.maxParticipants,
    penanggungJawab: camelCaseData.penanggungJawab,
    lspPenyelenggara: camelCaseData.lspPenyelenggara,
    deskripsi: camelCaseData.description,
    status: camelCaseData.status,
    schemeId: camelCaseData.schemeId,
    createdAt: camelCaseData.createdAt,
    updatedAt: camelCaseData.updatedAt,
  };
};

async function createEuk(eukData) {
  const dbData = mapEukInputToDb(eukData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO events (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapEukOutputToApi(res.rows[0]);
}

async function getAllEuks({ search, limit, offset }) {
  let queryText = `
    SELECT e.*, s.name AS scheme_name
    FROM events e
    LEFT JOIN certification_schemes s ON e.scheme_id = s.id
  `;
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(e.event_name) LIKE $1 OR LOWER(e.location) LIKE $1 OR LOWER(e.penanggung_jawab) LIKE $1)"
    );
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY e.start_date DESC";

  if (limit) {
    queryParams.push(limit);
    queryText += ` LIMIT $${queryParams.length}`;
  }
  if (offset) {
    queryParams.push(offset);
    queryText += ` OFFSET $${queryParams.length}`;
  }

  const res = await query(queryText, queryParams);

  // Map setiap baris hasil
  return res.rows.map((row) => {
    const apiOutput = mapEukOutputToApi(row);
    // Tambahkan nama skema jika ada
    apiOutput.schemeName = row.scheme_name;
    return apiOutput;
  });
}

async function getTotalEuks(search) {
  let queryText = "SELECT COUNT(*) FROM events";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(event_name) LIKE $1 OR LOWER(location) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

// Tambahkan implementasi untuk GET by ID
async function getEukById(id) {
  const res = await query("SELECT * FROM events WHERE id = $1", [id]);
  return mapEukOutputToApi(res.rows[0]);
}

// Tambahkan implementasi untuk UPDATE
async function updateEuk(id, eukData) {
  const dbData = mapEukInputToDb(eukData);

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const key in dbData) {
    if (dbData.hasOwnProperty(key)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(dbData[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return null; // Tidak ada data untuk diupdate
  }

  values.push(id); // ID adalah parameter terakhir

  const res = await query(
    `UPDATE events SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return mapEukOutputToApi(res.rows[0]);
}

// Tambahkan implementasi untuk DELETE
async function deleteEuk(id) {
  const res = await query("DELETE FROM events WHERE id = $1 RETURNING id", [
    id,
  ]);
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

module.exports = {
  createEuk,
  getAllEuks,
  getTotalEuks,
  getEukById,
  updateEuk,
  deleteEuk,
};
```

## lsp-backend/modules/euk/EventUjiKompetensiRoutes.js

```js
// lsp-backend/modules/euk/EventUjiKompetensiRoutes.js
const eukController = require("./EventUjiKompetensiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function eukRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  // GET All EUK (Auth required)
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    eukController.getAllEuksHandler
  );

  // GET EUK by ID (Auth required)
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    eukController.getEukByIdHandler
  );

  // CRUD (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    eukController.createEukHandler
  );
  fastify.put(
    "/:id",
    { preHandler: preHandlerAdmin },
    eukController.updateEukHandler
  );
  fastify.delete(
    "/:id",
    { preHandler: preHandlerAdmin },
    eukController.deleteEukHandler
  );
}

module.exports = eukRoutes;
```

## lsp-backend/modules/lsp/LembagaSertifikasiProfesiController.js

```js
// lsp-backend/modules/lsp/LembagaSertifikasiProfesiController.js
const lspModel = require("./LembagaSertifikasiProfesiModel");

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

## lsp-backend/modules/lsp/LembagaSertifikasiProfesiModel.js

```js
// lsp-backend/modules/lsp/LembagaSertifikasiProfesiModel.js
const { query } = require("../../utils/db");
const { mapToSnakeCase, mapToCamelCase } = require("../../utils/dataMapper"); // Import utilitas

async function createLsp(lspData) {
  // 1. Konversi data dari camelCase ke snake_case
  const snakeCaseData = mapToSnakeCase(lspData);

  // Filter keys yang valid (sesuai skema lsp_institutions)
  // Karena kita tidak memiliki skema DB di sini, kita asumsikan semua key yang dikirim adalah valid.
  const keys = Object.keys(snakeCaseData);
  const values = Object.values(snakeCaseData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO lsp_institutions (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );

  // 2. Konversi hasil kembali ke camelCase sebelum dikembalikan
  return mapToCamelCase(res.rows[0]);
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
  // 3. Konversi hasil kembali ke camelCase
  return mapToCamelCase(res.rows);
}

async function getLspById(id) {
  const res = await query("SELECT * FROM lsp_institutions WHERE id = $1", [id]);
  // 4. Konversi hasil kembali ke camelCase
  return mapToCamelCase(res.rows[0]);
}

async function updateLsp(id, lspData) {
  // 1. Konversi data dari camelCase ke snake_case
  const snakeCaseData = mapToSnakeCase(lspData);

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const key in snakeCaseData) {
    if (snakeCaseData.hasOwnProperty(key)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(snakeCaseData[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return null; // Tidak ada data untuk diupdate
  }

  // Tambahkan updated_at
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id); // ID adalah parameter terakhir

  const res = await query(
    `UPDATE lsp_institutions SET ${updates.join(
      ", "
    )} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  // 2. Konversi hasil kembali ke camelCase
  return mapToCamelCase(res.rows[0]);
}

async function deleteLsp(id) {
  const res = await query(
    "DELETE FROM lsp_institutions WHERE id = $1 RETURNING id",
    [id]
  );
  // 3. Konversi hasil kembali ke camelCase (hanya ID yang terpengaruh)
  return mapToCamelCase(res.rows[0]);
}

async function getTotalLsps(search) {
  let queryText = "SELECT COUNT(*) FROM lsp_institutions";
  let queryParams = [];
  let conditions = [];

  if (search) {
    // Note: Search tetap menggunakan snake_case karena berinteraksi langsung dengan DB
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

## lsp-backend/modules/lsp/LembagaSertifikasiProfesiRoutes.js

```js
// lsp-backend/modules/lsp/LembagaSertifikasiProfesiRoutes.js
const lspController = require("./LembagaSertifikasiProfesiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function lspRoutes(fastify, options) {
  // GET /api/lsps
  fastify.get(
    "/",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getAllLspsHandler
  );
  // GET /api/lsps/:id
  fastify.get(
    "/:id",
    {
      preHandler: [authenticate /*, authorize(['Admin', 'Asesi', 'Asesor'])*/],
    },
    lspController.getLspByIdHandler
  );

  // POST /api/lsps (Hanya Admin)
  fastify.post(
    "/",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.createLspHandler
  );
  // PUT /api/lsps/:id (Hanya Admin)
  fastify.put(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.updateLspHandler
  );
  // DELETE /api/lsps/:id (Hanya Admin)
  fastify.delete(
    "/:id",
    { preHandler: [authenticate, authorize(["Admin"])] },
    lspController.deleteLspHandler
  );
}

module.exports = lspRoutes;
```

## lsp-backend/modules/scheme/SkemaSertifikasiController.js

```js
// lsp-backend/modules/scheme/SkemaSertifikasiController.js
const schemeModel = require("./SkemaSertifikasiModel");

async function createSchemeHandler(request, reply) {
  try {
    const newScheme = await schemeModel.createScheme(request.body);
    reply
      .status(201)
      .send({ message: "Skema created successfully", data: newScheme });
  } catch (error) {
    console.error("Error creating Skema:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

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

async function getSchemeByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const scheme = await schemeModel.getSchemeById(id);
    if (!scheme) {
      return reply.status(404).send({ message: "Skema not found" });
    }
    reply.send({ message: "Skema retrieved successfully", data: scheme });
  } catch (error) {
    console.error("Error getting Skema by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateSchemeHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedScheme = await schemeModel.updateScheme(id, request.body);
    if (!updatedScheme) {
      return reply.status(404).send({ message: "Skema not found" });
    }
    reply.send({ message: "Skema updated successfully", data: updatedScheme });
  } catch (error) {
    console.error("Error updating Skema:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteSchemeHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedScheme = await schemeModel.deleteScheme(id);
    if (!deletedScheme) {
      return reply.status(404).send({ message: "Skema not found" });
    }
    reply.send({ message: "Skema deleted successfully", id: deletedScheme.id });
  } catch (error) {
    console.error("Error deleting Skema:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createSchemeHandler,
  getAllSchemesHandler,
  getSchemeByIdHandler,
  updateSchemeHandler,
  deleteSchemeHandler,
};
```

## lsp-backend/modules/scheme/SkemaSertifikasiModel.js

```js
// lsp-backend/modules/scheme/SkemaSertifikasiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper");

// Custom mapping untuk input dari frontend/API ke DB
const mapSchemeInputToDb = (input) => {
  const dbData = {
    code: input.kodeSkema,
    name: input.namaSkema,
    description: input.description, // Asumsi description opsional
    skkni: input.skkni,
    keterangan_bukti: input.keteranganBukti,
    is_active: input.isActive,
  };

  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );
  return dbData;
};

// Custom mapping untuk output dari DB ke API
const mapSchemeOutputToApi = (dbObject) => {
  if (!dbObject) return null;

  // Gunakan mapToCamelCase untuk konversi dasar
  const camelCaseData = mapToCamelCase(dbObject);

  // Sesuaikan kembali nama field API
  return {
    id: camelCaseData.id,
    kodeSkema: camelCaseData.code,
    namaSkema: camelCaseData.name,
    skkni: camelCaseData.skkni,
    keteranganBukti: camelCaseData.keteranganBukti,
    isActive: camelCaseData.isActive,
    // Properti yang didapatkan dari join atau agregasi
    persyaratanCount: camelCaseData.persyaratanCount || 0,
  };
};

async function createScheme(schemeData) {
  const dbData = mapSchemeInputToDb(schemeData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO certification_schemes (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapSchemeOutputToApi(res.rows[0]);
}

async function getAllSchemes({ search, limit, offset }) {
  // Query ini disederhanakan, di dunia nyata mungkin perlu JOIN untuk mendapatkan persyaratanCount
  let queryText = "SELECT * FROM certification_schemes";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(name) LIKE $1 OR LOWER(code) LIKE $1 OR LOWER(skkni) LIKE $1)"
    );
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
  return res.rows.map(mapSchemeOutputToApi);
}

async function getTotalSchemes(search) {
  let queryText = "SELECT COUNT(*) FROM certification_schemes";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(name) LIKE $1 OR LOWER(code) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

async function getSchemeById(id) {
  const res = await query("SELECT * FROM certification_schemes WHERE id = $1", [
    id,
  ]);
  return mapSchemeOutputToApi(res.rows[0]);
}

async function updateScheme(id, schemeData) {
  const dbData = mapSchemeInputToDb(schemeData);

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const key in dbData) {
    if (dbData.hasOwnProperty(key)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(dbData[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(id);

  const res = await query(
    `UPDATE certification_schemes SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return mapSchemeOutputToApi(res.rows[0]);
}

async function deleteScheme(id) {
  const res = await query(
    "DELETE FROM certification_schemes WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

module.exports = {
  createScheme,
  getAllSchemes,
  getTotalSchemes,
  getSchemeById,
  updateScheme,
  deleteScheme,
};
```

## lsp-backend/modules/scheme/SkemaSertifikasiRoutes.js

```js
// lsp-backend/modules/scheme/SkemaSertifikasiRoutes.js
const schemeController = require("./SkemaSertifikasiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function schemeRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  // GET All Schemes (Auth required)
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    schemeController.getAllSchemesHandler
  );

  // GET Scheme by ID (Auth required)
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    schemeController.getSchemeByIdHandler
  );

  // CRUD (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    schemeController.createSchemeHandler
  );
  fastify.put(
    "/:id",
    { preHandler: preHandlerAdmin },
    schemeController.updateSchemeHandler
  );
  fastify.delete(
    "/:id",
    { preHandler: preHandlerAdmin },
    schemeController.deleteSchemeHandler
  );

  // Rute untuk persyaratan skema (nested resource)
  // fastify.get("/:schemeId/requirements", { preHandler: preHandlerAuth }, schemeController.getRequirementsHandler);
}

module.exports = schemeRoutes;
```

## lsp-backend/modules/tuk/TempatUjiKompetensiController.js

```js
// lsp-backend/modules/tuk/TempatUjiKompetensiController.js
const tukModel = require("./TempatUjiKompetensiModel");

async function createTukHandler(request, reply) {
  try {
    const newTuk = await tukModel.createTuk(request.body);
    reply
      .status(201)
      .send({ message: "TUK created successfully", data: newTuk });
  } catch (error) {
    console.error("Error creating TUK:", error);
    reply
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

async function getAllTuksHandler(request, reply) {
  try {
    const { search, page = 1, limit = 10 } = request.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const tuks = await tukModel.getAllTuks({
      search,
      limit: parseInt(limit),
      offset,
    });
    const total = await tukModel.getTotalTuks(search);

    reply.send({
      message: "TUKs retrieved successfully",
      data: tuks,
      pagination: {
        totalItems: total,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all TUKs:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function getTukByIdHandler(request, reply) {
  try {
    const { id } = request.params;
    const tuk = await tukModel.getTukById(id);
    if (!tuk) {
      return reply.status(404).send({ message: "TUK not found" });
    }
    reply.send({ message: "TUK retrieved successfully", data: tuk });
  } catch (error) {
    console.error("Error getting TUK by ID:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function updateTukHandler(request, reply) {
  try {
    const { id } = request.params;
    const updatedTuk = await tukModel.updateTuk(id, request.body);
    if (!updatedTuk) {
      return reply.status(404).send({ message: "TUK not found" });
    }
    reply.send({ message: "TUK updated successfully", data: updatedTuk });
  } catch (error) {
    console.error("Error updating TUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

async function deleteTukHandler(request, reply) {
  try {
    const { id } = request.params;
    const deletedTuk = await tukModel.deleteTuk(id);
    if (!deletedTuk) {
      return reply.status(404).send({ message: "TUK not found" });
    }
    reply.send({ message: "TUK deleted successfully", id: deletedTuk.id });
  } catch (error) {
    console.error("Error deleting TUK:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}

module.exports = {
  createTukHandler,
  getAllTuksHandler,
  getTukByIdHandler,
  updateTukHandler,
  deleteTukHandler,
};
```

## lsp-backend/modules/tuk/TempatUjiKompetensiModel.js

```js
// lsp-backend/modules/tuk/TempatUjiKompetensiModel.js
const { query } = require("../../utils/db");
const { mapToCamelCase } = require("../../utils/dataMapper");

// Custom mapping untuk input dari frontend/API ke DB
const mapTukInputToDb = (input) => {
  const dbData = {
    kode_tuk: input.kodeTuk,
    nama_tempat: input.namaTempat,
    jenis_tuk: input.jenisTuk,
    lsp_induk_id: input.lspIndukId, // Asumsi ID LSP, jika tidak ada, perlu ditambahkan lookup
    penanggung_jawab: input.penanggungJawab,
    lisensi_info: input.lisensi,
    skkni_info: input.skkni,
    jadwal_info: input.jadwal,
  };

  Object.keys(dbData).forEach(
    (key) => dbData[key] === undefined && delete dbData[key]
  );
  return dbData;
};

// Custom mapping untuk output dari DB ke API
const mapTukOutputToApi = (dbObject) => {
  if (!dbObject) return null;

  // Gunakan mapToCamelCase untuk semua kolom standar
  const camelCaseData = mapToCamelCase(dbObject);

  // Sesuaikan kembali nama field yang non-standar/custom
  return {
    id: camelCaseData.id,
    kodeTuk: camelCaseData.kodeTuk,
    namaTempat: camelCaseData.namaTempat,
    jenisTuk: camelCaseData.jenisTuk,
    penanggungJawab: camelCaseData.penanggungJawab,
    lisensi: camelCaseData.lisensiInfo, // Mapping lisensi_info -> lisensi
    skkni: camelCaseData.skkniInfo, // Mapping skkni_info -> skkni
    jadwal: camelCaseData.jadwalInfo, // Mapping jadwal_info -> jadwal
    lspIndukId: camelCaseData.lspIndukId,

    // Data yang diambil dari join (jika ada)
    lspInduk: camelCaseData.namaLsp,
    lspJenis: camelCaseData.jenisLsp,
  };
};

async function createTuk(tukData) {
  const dbData = mapTukInputToDb(tukData);

  const keys = Object.keys(dbData);
  const values = Object.values(dbData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const res = await query(
    `INSERT INTO tempat_uji_kompetensi (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return mapTukOutputToApi(res.rows[0]);
}

async function getAllTuks({ search, limit, offset }) {
  let queryText = `
    SELECT t.*, l.nama_lsp, l.jenis_lsp
    FROM tempat_uji_kompetensi t
    LEFT JOIN lsp_institutions l ON t.lsp_induk_id = l.id
  `;
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(t.nama_tempat) LIKE $1 OR LOWER(t.kode_tuk) LIKE $1 OR LOWER(t.penanggung_jawab) LIKE $1 OR LOWER(l.nama_lsp) LIKE $1)"
    );
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY t.created_at DESC";

  if (limit) {
    queryParams.push(limit);
    queryText += ` LIMIT $${queryParams.length}`;
  }
  if (offset) {
    queryParams.push(offset);
    queryText += ` OFFSET $${queryParams.length}`;
  }

  const res = await query(queryText, queryParams);
  return res.rows.map(mapTukOutputToApi);
}

async function getTukById(id) {
  const res = await query(
    `SELECT t.*, l.nama_lsp, l.jenis_lsp
         FROM tempat_uji_kompetensi t
         LEFT JOIN lsp_institutions l ON t.lsp_induk_id = l.id
         WHERE t.id = $1`,
    [id]
  );
  return mapTukOutputToApi(res.rows[0]);
}

async function updateTuk(id, tukData) {
  const dbData = mapTukInputToDb(tukData);

  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const key in dbData) {
    if (dbData.hasOwnProperty(key)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(dbData[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(id);

  const res = await query(
    `UPDATE tempat_uji_kompetensi SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  // Untuk mendapatkan lspInduk dan lspJenis, kita harus melakukan query ulang atau join
  // Untuk sederhana, kita akan update dan kemudian mengambil data lengkap (getTukById)
  if (res.rows[0]) {
    return getTukById(id);
  }
  return null;
}

async function deleteTuk(id) {
  const res = await query(
    "DELETE FROM tempat_uji_kompetensi WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0] ? { id: res.rows[0].id } : null;
}

async function getTotalTuks(search) {
  let queryText = "SELECT COUNT(*) FROM tempat_uji_kompetensi";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("(LOWER(nama_tempat) LIKE $1 OR LOWER(kode_tuk) LIKE $1)");
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  const res = await query(queryText, queryParams);
  return parseInt(res.rows[0].count, 10);
}

module.exports = {
  createTuk,
  getAllTuks,
  getTotalTuks,
  getTukById,
  updateTuk,
  deleteTuk,
};
```

## lsp-backend/modules/tuk/TempatUjiKompetensiRoutes.js

```js
// lsp-backend/modules/tuk/TempatUjiKompetensiRoutes.js
const tukController = require("./TempatUjiKompetensiController");
const authenticate = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

async function tukRoutes(fastify, options) {
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  // GET All TUK (Auth required)
  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    tukController.getAllTuksHandler
  );

  // GET TUK by ID (Auth required)
  fastify.get(
    "/:id",
    { preHandler: preHandlerAuth },
    tukController.getTukByIdHandler
  );

  // CRUD (Admin only)
  fastify.post(
    "/",
    { preHandler: preHandlerAdmin },
    tukController.createTukHandler
  );
  fastify.put(
    "/:id",
    { preHandler: preHandlerAdmin },
    tukController.updateTukHandler
  );
  fastify.delete(
    "/:id",
    { preHandler: preHandlerAdmin },
    tukController.deleteTukHandler
  );
}

module.exports = tukRoutes;
```

## lsp-backend/modules/user/userController.js

```js
// lsp-backend/modules/user/userController.js
const userModel = require("./userModel");
const bcrypt = require("bcryptjs");

async function getMyProfile(request, reply) {
  try {
    const userId = request.user.id;
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
    const userWithPassword = await userModel.findUserByUsername(
      request.user.username
    );
    if (!userWithPassword || userWithPassword.id !== userId) {
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

module.exports = {
  getMyProfile,
  changePassword,
};
```

## lsp-backend/modules/user/userModel.js

```js
// lsp-backend/modules/user/userModel.js
const { query } = require("../../utils/db");

async function findUserById(userId) {
  const res = await query(
    `SELECT 
        u.id, u.username, u.email, u.role_id, r.name AS role_name,
        ap.full_name, ap.phone_number, ap.address, ap.ktp_number
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN asesi_profiles ap ON u.id = ap.user_id
    WHERE u.id = $1`,
    [userId]
  );
  return res.rows[0];
}

async function findUserByUsername(username) {
  // Khusus untuk mendapatkan password saat verifikasi ganti password
  const res = await query(
    "SELECT id, username, password, email, role_id FROM users WHERE username = $1",
    [username]
  );
  return res.rows[0];
}

async function updateUserPassword(userId, hashedPassword) {
  const res = await query(
    "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id",
    [hashedPassword, userId]
  );
  return res.rows[0];
}

module.exports = {
  findUserById,
  findUserByUsername,
  updateUserPassword,
};
```

## lsp-backend/modules/user/userRoutes.js

```js
// lsp-backend/modules/user/userRoutes.js
const userController = require("./userController");
const authenticate = require("../../middlewares/authMiddleware");

async function userRoutes(fastify, options) {
  // Semua rute di sini memerlukan autentikasi
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
}

module.exports = userRoutes;
```

## lsp-backend/utils/dataMapper.js

```js
// lsp-backend/utils/dataMapper.js

/**
 * Mengubah string dari camelCase menjadi snake_case.
 * Contoh: "namaLsp" -> "nama_lsp"
 */
const toSnakeCase = (str) => {
  if (!str) return str;
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};

/**
 * Mengubah string dari snake_case menjadi camelCase.
 * Contoh: "nama_lsp" -> "namaLsp"
 */
const toCamelCase = (str) => {
  if (!str) return str;
  return str.replace(/([_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("_", "");
  });
};

/**
 * Mengubah kunci objek dari camelCase ke snake_case.
 */
const mapToSnakeCase = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const newKey = toSnakeCase(key);
    acc[newKey] = obj[key];
    return acc;
  }, {});
};

/**
 * Mengubah kunci objek atau array objek dari snake_case ke camelCase.
 */
const mapToCamelCase = (data) => {
  if (!data) return data;

  // Jika input adalah array, map setiap item
  if (Array.isArray(data)) {
    return data.map(mapToCamelCase);
  }

  // Jika input bukan objek, kembalikan data asli
  if (typeof data !== "object" || data === null) return data;

  // Jika input adalah objek, konversi kuncinya
  return Object.keys(data).reduce((acc, key) => {
    const newKey = toCamelCase(key);
    acc[newKey] = data[key];
    return acc;
  }, {});
};

module.exports = {
  mapToSnakeCase,
  mapToCamelCase,
};
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

// Tambahkan fungsi untuk mendapatkan client pool secara langsung (untuk transaksi)
async function getClient() {
  return pool.connect();
}

module.exports = {
  query,
  pool,
  getClient, // Export fungsi baru
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
