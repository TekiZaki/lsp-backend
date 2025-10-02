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
ADMIN_SECRET=your_admin_secret
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

## 📌 Dokumentasi API

Dokumentasi API tersedia di file [postman3.md](./postman3.md) dan dapat diimpor ke Postman. Berikut ringkasan modul:

### 🔑 Modul Autentikasi (`/api/auth`)

- `POST /auth/register/asesi` → Pendaftaran Asesi.
- `POST /auth/register/privileged` → Pendaftaran Admin/Asesor (butuh `ADMIN_SECRET`).
- `POST /auth/login` → Login pengguna.
- `POST /auth/forgot-password` → Reset password.

### 👤 Modul User (`/api/users`)

- `GET /users/profile` → Ambil data profil user (require JWT).
- `POST /users/change-password` → Ganti password (require JWT).

### 🏢 Modul LSP (`/api/lsps`)

- `GET /lsps` → Ambil semua LSP.
- `GET /lsps/:id` → Detail LSP.
- `POST /lsps` → Tambah LSP (**Admin only**).
- `PUT /lsps/:id` → Update LSP (**Admin only**).
- `DELETE /lsps/:id` → Hapus LSP (**Admin only**).

### 📜 Modul Skema Sertifikasi (`/api/schemes`)

- `GET /schemes` → Ambil semua skema sertifikasi.
- `GET /schemes/:id` → Detail skema.
- `POST /schemes` → Tambah skema (**Admin only**).
- `PUT /schemes/:id` → Update skema (**Admin only**).
- `DELETE /schemes/:id` → Hapus skema (**Admin only**).

### 🏫 Modul TUK (`/api/tuks`)

- `GET /tuks` → Ambil semua TUK.
- `GET /tuks/:id` → Detail TUK.
- `POST /tuks` → Tambah TUK (**Admin only**).
- `PUT /tuks/:id` → Update TUK (**Admin only**).
- `DELETE /tuks/:id` → Hapus TUK (**Admin only**).

### 📅 Modul EUK (`/api/euks`)

- `GET /euks` → Ambil semua event uji kompetensi.
- `GET /euks/:id` → Detail EUK.
- `POST /euks` → Tambah EUK (**Admin only**).
- `PUT /euks/:id` → Update EUK (**Admin only**).
- `DELETE /euks/:id` → Hapus EUK (**Admin only**).

---

## 🔒 Middleware

- **authMiddleware** → Validasi JWT token.
- **authorizeMiddleware** → Batasi akses berdasarkan role (misalnya: Admin).

---

## 🛠️ Database

### Tabel utama yang digunakan:

- **users** (id, username, password, email, role_id, created_at, updated_at)
- **roles** (id, name)
- **lsp_institutions** (informasi detail LSP)
- **tempat_uji_kompetensi (TUK)** (informasi lokasi uji)
- **events (EUK)** (event uji kompetensi terkait skema & LSP)
- **certification_schemes (Skema)** (informasi skema sertifikasi)
