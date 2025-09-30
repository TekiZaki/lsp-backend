# LSP Backend API

Backend untuk sistem manajemen **Lembaga Sertifikasi Profesi (LSP)** menggunakan **Node.js**, **Fastify**, **PostgreSQL**, dan **JWT Authentication**.  
Proyek ini menyediakan API untuk autentikasi, manajemen user, serta CRUD data **LSP, TUK, EUK, dan Skema Sertifikasi**.

---

## 🚀 Tech Stack

- **Node.js + Fastify** → Framework server-side
- **PostgreSQL** → Database utama
- **JWT (JSON Web Token)** → Autentikasi
- **bcryptjs** → Enkripsi password
- **dotenv** → Manajemen konfigurasi environment

---

## 📂 Struktur Proyek

```

lsp-backend/
├── app.js                # Inisialisasi aplikasi Fastify
├── server.js             # Entry point server
├── config/               # Konfigurasi DB & JWT
├── controllers/          # Logika bisnis (Auth, User, LSP, TUK, EUK, Skema)
├── middlewares/          # Middleware autentikasi & otorisasi
├── models/               # Query database
├── routes/               # Definisi routing API
└── utils/                # Helper (DB & JWT utils)

```

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root project dengan variabel berikut:

```env
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/lspdb
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
```

---

## ▶️ Menjalankan Proyek

1. **Clone repo**

   ```bash
   git clone https://github.com/TekiZaki/lsp-backend.git
   cd lsp-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Jalankan server**

   ```bash
   npm start
   ```

   Server akan berjalan di `http://localhost:3000`

---

## 📌 API Endpoints

### 🔑 Autentikasi (`/api/auth`)

- `POST /register` → Register user baru (Admin/Asesi/Asesor)
- `POST /login` → Login & dapatkan token JWT

### 👤 User (`/api/users`)

- `GET /profile` → Ambil data profil user (require JWT)
- `POST /change-password` → Ganti password (require JWT)

### 🏢 LSP (`/api/lsps`)

- `GET /` → Ambil semua LSP (paginasi & search tersedia, require JWT)
- `GET /:id` → Ambil detail LSP berdasarkan ID
- `POST /` → Tambah LSP baru (**Admin only**)
- `PUT /:id` → Update LSP (**Admin only**)
- `DELETE /:id` → Hapus LSP (**Admin only**)

### 🏫 TUK (`/api/tuks`)

- `GET /` → Ambil semua TUK (paginasi & search tersedia, require JWT)
- CRUD endpoint lainnya tersedia di backend (hanya Admin), bisa diaktifkan sesuai kebutuhan.

### 📅 EUK / Event Uji Kompetensi (`/api/euks`)

- `GET /` → Ambil semua event (paginasi & search tersedia, require JWT)
- CRUD endpoint lainnya tersedia di backend (hanya Admin), bisa diaktifkan sesuai kebutuhan.

### 📜 Skema Sertifikasi (`/api/schemes`)

- `GET /` → Ambil semua skema sertifikasi (paginasi & search tersedia, require JWT)
- CRUD endpoint lainnya tersedia di backend (hanya Admin), bisa diaktifkan sesuai kebutuhan.

---

## 🔒 Middleware

- **authMiddleware** → Validasi JWT token
- **authorizeMiddleware** → Batasi akses berdasarkan role (misalnya: Admin)

---

## 🛠️ Database

### Tabel utama yang digunakan:

- **users** (id, username, password, email, role_id, created_at, updated_at)
- **roles** (id, name)
- **lsp_institutions** (informasi detail LSP)
- **tempat_uji_kompetensi (TUK)** (informasi lokasi uji)
- **events (EUK)** (event uji kompetensi terkait skema & LSP)
- **certification_schemes (Skema)** (informasi skema sertifikasi)

---

## 📝 Contoh Dokumentasi API (Postman)

### 1. Register User

- URL: `http://localhost:3000/api/auth/register`
- Method: POST
- Headers: Content-Type: application/json
- Body:

```json
{
  "username": "adminuser",
  "password": "password123",
  "email": "admin@example.com",
  "role_name": "Admin"
}
```

### 2. Login

- URL: `http://localhost:3000/api/auth/login`
- Method: POST
- Body:

```json
{
  "username": "adminuser",
  "password": "password123"
}
```

### 3. Get My Profile (JWT Required)

- URL: `http://localhost:3000/api/users/profile`
- Method: GET
- Headers:

  - Authorization: Bearer `<jwt_token>`

### 4. Change Password (JWT Required)

- URL: `http://localhost:3000/api/users/change-password`
- Method: POST
- Headers:

  - Authorization: Bearer `<jwt_token>`

- Body:

```json
{
  "currentPassword": "password123",
  "newPassword": "newsecurepassword"
}
```
