# Code Dump for lsp-backend

## lsp-backend/app.js

```js
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
-- ======================
-- ROLE & USER
-- ======================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- Admin, Asesi, Asesor
);

INSERT INTO roles (name) VALUES ('Admin'), ('Asesi'), ('Asesor')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- MASTER DATA
-- ======================
CREATE TABLE IF NOT EXISTS lsp_institutions (
    id SERIAL PRIMARY KEY,
    kode_lsp VARCHAR(50) UNIQUE NOT NULL,
    nama_lsp VARCHAR(255) NOT NULL,
    jenis_lsp VARCHAR(10) NOT NULL CHECK (jenis_lsp IN ('P1','P2','P3')),
    direktur_lsp VARCHAR(255),
    manajer_lsp VARCHAR(255),
    institusi_induk VARCHAR(255),
    skkni TEXT,
    telepon VARCHAR(50),
    faximile VARCHAR(50),
    whatsapp VARCHAR(50),
    alamat_email VARCHAR(255),
    website VARCHAR(255),
    alamat TEXT,
    desa VARCHAR(100),
    kecamatan VARCHAR(100),
    kota VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    nomor_lisensi VARCHAR(100),
    masa_berlaku DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tempat_uji_kompetensi (
    id SERIAL PRIMARY KEY,
    kode_tuk VARCHAR(50) UNIQUE NOT NULL,
    nama_tempat VARCHAR(255) NOT NULL,
    jenis_tuk VARCHAR(50) NOT NULL CHECK (jenis_tuk IN ('Sewaktu','Permanen','Mandiri')),
    lsp_induk_id INTEGER REFERENCES lsp_institutions(id) ON DELETE SET NULL,
    penanggung_jawab VARCHAR(255),
    lisensi_info TEXT,
    skkni_info TEXT,
    jadwal_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certification_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    skkni TEXT,
    keterangan_bukti TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scheme_requirements (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id) ON DELETE CASCADE,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competency_units (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- EVENT & REGISTRASI
-- ======================
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER REFERENCES certification_schemes(id) ON DELETE SET NULL,
    event_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE,
    location TEXT,
    description TEXT,
    max_participants INTEGER,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','closed','completed')),
    lsp_penyelenggara VARCHAR(255),
    penanggung_jawab VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asesi_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending_payment'
        CHECK (status IN ('pending_payment','waiting_verification','registered','rejected')),
    payment_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- ======================
-- ASESOR & ASESI
-- ======================
CREATE TABLE IF NOT EXISTS assessors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nip VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    expertise TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asesi_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male','female')),
    phone_number VARCHAR(20),
    address TEXT,
    education_level VARCHAR(100),
    ktp_number VARCHAR(20) UNIQUE,
    ktp_scan_url TEXT,
    cv_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- JADWAL & HASIL
-- ======================
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    asesor_id INTEGER REFERENCES assessors(id) ON DELETE SET NULL,
    asesi_registration_id INTEGER REFERENCES asesi_registrations(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    tuk_location TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    asesi_registration_id INTEGER NOT NULL REFERENCES asesi_registrations(id) ON DELETE CASCADE,
    asesor_id INTEGER NOT NULL REFERENCES assessors(id) ON DELETE CASCADE,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,
    result VARCHAR(50) NOT NULL CHECK (result IN ('Kompeten','Belum Kompeten')),
    feedback TEXT,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- LAINNYA
-- ======================
CREATE TABLE IF NOT EXISTS biaya (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER REFERENCES certification_schemes(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_reports (
    id SERIAL PRIMARY KEY,
    asesi_registration_id INTEGER NOT NULL REFERENCES asesi_registrations(id) ON DELETE CASCADE,
    amount_paid DECIMAL(15,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(100),
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success','failed','pending')),
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_notifications (
    id SERIAL PRIMARY KEY,
    recipient_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS frontpage_content (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
const { getClient } = require("../utils/db"); // Import getClient

async function register(request, reply) {
  const client = await getClient();
  try {
    // Data dari frontend RegisterAsesiPage:
    // NPP (-> username), email, password (asumsi nanti ditambahkan),
    // namaLengkap (-> full_name), nik (-> ktp_number), nomorHp (-> phone_number),
    // alamat (-> address), serta data wilayah.

    // Untuk saat ini, kita akan menambahkan field 'password' di body request
    // Karena frontend belum mengirimkan password, kita asumsikan ini adalah tahap 1
    // Registrasi (buat akun) dan tahap 2 (buat/ubah password) atau password ada di request body.

    const {
      username, // NPP
      password, // Asumsi password juga dikirim
      email,
      full_name,
      ktp_number,
      phone_number,
      address,
      // data wilayah lainnya diabaikan dulu
    } = request.body;

    // Hardcode role_name ke 'Asesi' untuk registrasi umum
    const role_name = "Asesi";

    if (!username || !password || !email || !full_name || !ktp_number) {
      return reply.status(400).send({ message: "Required fields are missing" });
    }

    await client.query("BEGIN");

    // 1. Cek username
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      await client.query("ROLLBACK");
      return reply
        .status(409)
        .send({ message: "Username (NPP) already taken" });
    }

    // 2. Dapatkan role_id 'Asesi'
    const role = await userModel.getRoleByName(role_name);
    if (!role) {
      await client.query("ROLLBACK");
      return reply.status(400).send({ message: "Role 'Asesi' not found" });
    }
    const role_id = role.id;

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat user baru (Tabel users)
    const userRes = await client.query(
      "INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id",
      [username, hashedPassword, email, role_id]
    );
    const newUser = userRes.rows[0];

    // 5. Buat profil Asesi (Tabel asesi_profiles)
    await client.query(
      `INSERT INTO asesi_profiles (
          user_id, full_name, phone_number, address, ktp_number
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [newUser.id, full_name, phone_number, address, ktp_number]
    );

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
  // ... (Logika login tidak berubah, hanya memvalidasi NPP/Username)
  try {
    const { username, password } = request.body; // username adalah NPP

    if (!username || !password) {
      return reply
        .status(400)
        .send({ message: "Username (NPP) and password are required" });
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

async function forgotPassword(request, reply) {
  try {
    const { npp, ktp_number, email } = request.body;

    // TODO: Implementasi validasi NPP/KTP/Email dan kirim link reset
    // Untuk simulasi, kita hanya cek keberadaan data
    if (!npp || !ktp_number || !email) {
      return reply.status(400).send({ message: "All fields are required" });
    }

    // Logika simulasi:
    // 1. Cari user berdasarkan NPP (username)
    const user = await userModel.findUserByUsername(npp);
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    // 2. Kirim pesan sukses (simulasi)
    // Di dunia nyata: Generate token reset, simpan di DB, kirim email berisi link.

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
  forgotPassword, // Export fungsi baru
};
```

## lsp-backend/controllers/eukController.js

```js
// controllers/eukController.js
const eukModel = require("../models/eukModel");

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

// ... (createEukHandler, getEukByIdHandler, updateEukHandler, deleteEukHandler)

module.exports = {
  getAllEuksHandler,
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

## lsp-backend/controllers/schemeController.js

```js
// controllers/schemeController.js
const schemeModel = require("../models/schemeModel");

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

// ... (createSchemeHandler, getSchemeByIdHandler, updateSchemeHandler, deleteSchemeHandler)

module.exports = {
  getAllSchemesHandler,
};
```

## lsp-backend/controllers/tukController.js

```js
// controllers/tukController.js
const tukModel = require("../models/tukModel");

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

// ... (createTukHandler, getTukByIdHandler, updateTukHandler, deleteTukHandler)

module.exports = {
  getAllTuksHandler,
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

## lsp-backend/models/eukModel.js

```js
// models/eukModel.js
const { query } = require("../utils/db");

async function createEuk(eukData) {
  const {
    scheme_id, // Skema yang diuji dalam event
    event_name,
    start_date,
    end_date,
    registration_deadline,
    location,
    description,
    max_participants,
    lsp_penyelenggara, // Tambahan untuk simulasi data frontend
    penanggung_jawab, // Tambahan untuk simulasi data frontend
  } = eukData;

  const res = await query(
    `INSERT INTO events (
        scheme_id, event_name, start_date, end_date, registration_deadline, location, description, max_participants, lsp_penyelenggara, penanggung_jawab
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      scheme_id,
      event_name,
      start_date,
      end_date,
      registration_deadline,
      location,
      description,
      max_participants,
      lsp_penyelenggara,
      penanggung_jawab,
    ]
  );
  return res.rows[0];
}

async function getAllEuks({ search, limit, offset }) {
  let queryText = "SELECT * FROM events";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push(
      "(LOWER(event_name) LIKE $1 OR LOWER(location) LIKE $1 OR LOWER(penanggung_jawab) LIKE $1)"
    );
    queryParams.push(`%${search.toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    queryText += " WHERE " + conditions.join(" AND ");
  }

  queryText += " ORDER BY start_date DESC";

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

// ... (getById, update, delete, getTotal methods, similar to lspModel)
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

module.exports = {
  createEuk,
  getAllEuks,
  getTotalEuks,
};
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

## lsp-backend/models/schemeModel.js

```js
// models/schemeModel.js
const { query } = require("../utils/db");

async function createScheme(schemeData) {
  const {
    name,
    code,
    description,
    skkni, // Asumsi field SKKNI ditambahkan di tabel schemes
    keterangan_bukti, // Tambahan untuk simulasi data frontend
  } = schemeData;

  const res = await query(
    `INSERT INTO certification_schemes (
        name, code, description, skkni, keterangan_bukti
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, code, description, skkni, keterangan_bukti]
  );
  return res.rows[0];
}

async function getAllSchemes({ search, limit, offset }) {
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
  return res.rows;
}

// ... (getById, update, delete, getTotal methods, similar to lspModel)
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

module.exports = {
  createScheme,
  getAllSchemes,
  getTotalSchemes,
};
```

## lsp-backend/models/tukModel.js

```js
// models/tukModel.js
const { query } = require("../utils/db");

async function createTuk(tukData) {
  const {
    kode_tuk,
    nama_tempat,
    jenis_tuk,
    lsp_induk_id, // Asumsi ini referensi ke lsp_institutions(id)
    penanggung_jawab,
    lisensi_info,
    skkni_info,
    jadwal_info,
  } = tukData;

  const res = await query(
    `INSERT INTO tempat_uji_kompetensi (
        kode_tuk, nama_tempat, jenis_tuk, lsp_induk_id, penanggung_jawab, lisensi_info, skkni_info, jadwal_info
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      kode_tuk,
      nama_tempat,
      jenis_tuk,
      lsp_induk_id,
      penanggung_jawab,
      lisensi_info,
      skkni_info,
      jadwal_info,
    ]
  );
  return res.rows[0];
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
  return res.rows;
}

// Tambahkan fungsi untuk getById, update, delete dan getTotal (mirip lspModel)
// ... (omitted for brevity, follow lspModel structure)
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
  // ... (export other functions)
};
```

## lsp-backend/models/userModel.js

```js
// models/userModel.js
const { query } = require("../utils/db");
const bcrypt = require("bcryptjs");

// ... (existing functions: createUser, findUserByUsername, findUserById, getRoleByName, updateUserPassword, getRoleById)

// Fungsi baru untuk membuat profil asesi
async function createAsesiProfile(userId, profileData) {
  const {
    full_name,
    phone_number,
    ktp_number, // NIK di frontend dipetakan ke ktp_number
    address,
    email,
    // Kita anggap data lokasi (provinsi, kota, dll) tidak disimpan di profil Asesi
    // Tetapi jika ingin disimpan, tambahkan kolom di asesi_profiles (sesuai sql2.sql)
  } = profileData;

  // Catatan: Asesi Profiles di sql2.sql tidak punya kolom email, tapi kita ambil dari data registrasi.
  // Kita akan menggunakan kolom yang ada di sql2.sql.

  const res = await query(
    `INSERT INTO asesi_profiles (
        user_id, full_name, phone_number, address, ktp_number
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [userId, full_name, phone_number, address, ktp_number]
  );
  return res.rows[0];
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  getRoleByName,
  updateUserPassword,
  getRoleById,
  createAsesiProfile, // Export fungsi baru
};
```

## lsp-backend/routes/authRoutes.js

```js
// routes/authRoutes.js
const authController = require("../controllers/authController");

async function authRoutes(fastify, options) {
  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
  fastify.post("/forgot-password", authController.forgotPassword); // Rute baru
}

module.exports = authRoutes;
```

## lsp-backend/routes/eukRoutes.js

```js
// routes/eukRoutes.js
const eukController = require("../controllers/eukController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

async function eukRoutes(fastify, options) {
  // Hanya Admin yang bisa CRUD EUK
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    eukController.getAllEuksHandler
  );
  // fastify.get("/:id", { preHandler: preHandlerAuth }, eukController.getEukByIdHandler);

  // fastify.post("/", { preHandler: preHandlerAdmin }, eukController.createEukHandler);
  // fastify.put("/:id", { preHandler: preHandlerAdmin }, eukController.updateEukHandler);
  // fastify.delete("/:id", { preHandler: preHandlerAdmin }, eukController.deleteEukHandler);
}

module.exports = eukRoutes;
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

## lsp-backend/routes/schemeRoutes.js

```js
// routes/schemeRoutes.js
const schemeController = require("../controllers/schemeController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

async function schemeRoutes(fastify, options) {
  // Hanya Admin yang bisa CRUD Skema
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    schemeController.getAllSchemesHandler
  );
  // fastify.get("/:id", { preHandler: preHandlerAuth }, schemeController.getSchemeByIdHandler);

  // fastify.post("/", { preHandler: preHandlerAdmin }, schemeController.createSchemeHandler);
  // fastify.put("/:id", { preHandler: preHandlerAdmin }, schemeController.updateSchemeHandler);
  // fastify.delete("/:id", { preHandler: preHandlerAdmin }, schemeController.deleteSchemeHandler);

  // Rute untuk persyaratan skema (nested resource)
  // fastify.get("/:schemeId/requirements", { preHandler: preHandlerAuth }, schemeController.getRequirementsHandler);
  // fastify.post("/:schemeId/requirements", { preHandler: preHandlerAdmin }, schemeController.createRequirementHandler);
}

module.exports = schemeRoutes;
```

## lsp-backend/routes/tukRoutes.js

```js
// routes/tukRoutes.js
const tukController = require("../controllers/tukController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

async function tukRoutes(fastify, options) {
  // Hanya Admin yang bisa CRUD TUK
  const preHandlerAdmin = [authenticate, authorize(["Admin"])];
  const preHandlerAuth = [authenticate];

  fastify.get(
    "/",
    { preHandler: preHandlerAuth },
    tukController.getAllTuksHandler
  );
  // fastify.get("/:id", { preHandler: preHandlerAuth }, tukController.getTukByIdHandler);

  // fastify.post("/", { preHandler: preHandlerAdmin }, tukController.createTukHandler);
  // fastify.put("/:id", { preHandler: preHandlerAdmin }, tukController.updateTukHandler);
  // fastify.delete("/:id", { preHandler: preHandlerAdmin }, tukController.deleteTukHandler);
}

module.exports = tukRoutes;
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
