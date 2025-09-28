# LSP Backend API

Backend untuk sistem manajemen **Lembaga Sertifikasi Profesi (LSP)** menggunakan **Node.js**, **Fastify**, **PostgreSQL**, dan **JWT Authentication**.
Proyek ini menyediakan API untuk autentikasi, manajemen user, serta CRUD data LSP.

---

## 🚀 Tech Stack

- **Node.js** + **Fastify** → Framework server-side
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
├── controllers/          # Logika bisnis (Auth, User, LSP)
├── middlewares/          # Middleware autentikasi & otorisasi
├── models/               # Query database (User & LSP)
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

- `POST /register` → Register user baru
- `POST /login` → Login & dapatkan token JWT

### 👤 User (`/api/users`)

- `GET /profile` → Ambil data profil user (require JWT)
- `POST /change-password` → Ganti password (require JWT)

### 🏢 LSP (`/api/lsps`)

- `GET /` → Ambil semua LSP (paginasi & search tersedia)
- `GET /:id` → Ambil detail LSP berdasarkan ID
- `POST /` → Tambah LSP baru (hanya Admin)
- `PUT /:id` → Update LSP (hanya Admin)
- `DELETE /:id` → Hapus LSP (hanya Admin)

---

## 🔒 Middleware

- **authMiddleware** → Validasi JWT token
- **authorizeMiddleware** → Batasi akses berdasarkan role (misalnya: Admin)

---

## 🛠️ Database

### Tabel yang digunakan:

- **users** (id, username, password, email, role_id, created_at, updated_at)
- **roles** (id, name)
- **lsp_institutions** (informasi detail LSP)

---

## 📝 Dokumentasi API

### 1. Register Admin/Asesi/Asesor

- URL: http://localhost:3000/auth/register
- Method: POST
- Headers: Content-Type: application/json
- Body (raw, JSON):

```json
{
  "username": "adminuser",
  "password": "password123",
  "email": "admin@example.com",
  "role_name": "Admin"
}
```

### 2. Login

- URL: http://localhost:3000/auth/login
- Method: POST
- Headers: Content-Type: application/json
- Body (raw, JSON):

```json
{
  "username": "adminuser",
  "password": "password123"
}
```

### 3. Get My Profile (Dilindungi JWT)

- URL: http://localhost:3000/users/profile
- Method: GET
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <your_jwt_token_here> (Ganti <your_jwt_token_here> dengan token yang Anda dapatkan dari login)

### 4. Change Password (Dilindungi JWT)

- URL: http://localhost:3000/users/change-password
- Method: POST
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <your_jwt_token_here>
- Body (raw, JSON):

```json
{
  "currentPassword": "password123",
  "newPassword": "newsecurepassword"
}
```
