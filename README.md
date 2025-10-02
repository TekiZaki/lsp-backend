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

## 📝 Dokumentasi API (Postman)

# Dokumentasi API - Autentikasi (AUTH)

Base URL: `http://localhost:3000/api/auth`

## 1. Registrasi Pengguna Baru

Endpoint ini digunakan untuk mendaftarkan pengguna baru (Admin, Asesi, atau Asesor). Karena implementasi di backend telah disesuaikan untuk menerima data detail Asesi saat mendaftar sebagai `Asesi`, format body akan berbeda tergantung pada `role_name`.

### 1.1. Registrasi Umum (Admin/Asesor)

Digunakan untuk peran yang hanya memerlukan data dasar (username, password, email).

| Detail      | Deskripsi                        |
| :---------- | :------------------------------- |
| **URL**     | `/register`                      |
| **Method**  | `POST`                           |
| **Headers** | `Content-Type: application/json` |

#### Body (Raw, JSON)

| Field       | Tipe   | Deskripsi                              | Wajib | Contoh                |
| :---------- | :----- | :------------------------------------- | :---- | :-------------------- |
| `username`  | String | Nama pengguna (misalnya: NPP)          | Ya    | `"adminuser"`         |
| `password`  | String | Kata sandi                             | Ya    | `"password123"`       |
| `email`     | String | Alamat email                           | Ya    | `"admin@example.com"` |
| `role_name` | String | Peran pengguna (`Admin` atau `Asesor`) | Ya    | `"Admin"`             |

```json
{
  "username": "adminuser",
  "password": "password123",
  "email": "admin@example.com",
  "role_name": "Admin"
}
```

#### Contoh Respon Sukses (Status: 201 Created)

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "adminuser",
    "email": "admin@example.com",
    "role_id": 1
  }
}
```

---

### 1.2. Registrasi Asesi (Disarankan)

Digunakan khusus untuk peran `Asesi`. Karena backend memodifikasi `register` untuk membuat entri di tabel `asesi_profiles` juga, body request memerlukan detail tambahan.

| Detail      | Deskripsi                        |
| :---------- | :------------------------------- |
| **URL**     | `/register`                      |
| **Method**  | `POST`                           |
| **Headers** | `Content-Type: application/json` |

#### Body (Raw, JSON)

| Field          | Tipe   | Deskripsi          | Wajib | Contoh                     |
| :------------- | :----- | :----------------- | :---- | :------------------------- |
| `username`     | String | NPP Asesi          | Ya    | `"12345678"`               |
| `password`     | String | Kata sandi         | Ya    | `"asesipass"`              |
| `email`        | String | Alamat email       | Ya    | `"asesi@pindad.co.id"`     |
| `full_name`    | String | Nama lengkap Asesi | Ya    | `"Budi Santoso"`           |
| `ktp_number`   | String | Nomor KTP/NIK      | Ya    | `"3273110001000001"`       |
| `phone_number` | String | Nomor telepon/HP   | Tidak | `"08123456789"`            |
| `address`      | String | Alamat lengkap     | Tidak | `"Jl. Asia Afrika No. 12"` |

**Catatan:** `role_name` tidak perlu dikirim dalam skenario ini karena controller mengasumsikannya sebagai `"Asesi"`. Jika Anda ingin menggunakan satu form register untuk semua peran, Anda harus menyertakan `role_name: "Asesi"`.

```json
{
  "username": "12345678",
  "password": "asesipass",
  "email": "asesi@pindad.co.id",
  "full_name": "Budi Santoso",
  "ktp_number": "3273110001000001",
  "phone_number": "08123456789",
  "address": "Jl. Asia Afrika No. 12, Bandung"
}
```

#### Contoh Respon Sukses (Status: 201 Created)

```json
{
  "message": "Asesi registered successfully",
  "user": {
    "id": 2,
    "username": "12345678",
    "email": "asesi@pindad.co.id",
    "role_id": 2
  }
}
```

---

## 2. Login Pengguna

Endpoint ini digunakan untuk mengautentikasi pengguna dan mendapatkan JSON Web Token (JWT) yang akan digunakan untuk mengakses rute yang dilindungi.

| Detail      | Deskripsi                        |
| :---------- | :------------------------------- |
| **URL**     | `/login`                         |
| **Method**  | `POST`                           |
| **Headers** | `Content-Type: application/json` |

#### Body (Raw, JSON)

| Field      | Tipe   | Deskripsi           | Wajib | Contoh          |
| :--------- | :----- | :------------------ | :---- | :-------------- |
| `username` | String | Nama pengguna (NPP) | Ya    | `"adminuser"`   |
| `password` | String | Kata sandi          | Ya    | `"password123"` |

```json
{
  "username": "adminuser",
  "password": "password123"
}
```

#### Contoh Respon Sukses (Status: 200 OK)

Simpan nilai `token` untuk digunakan dalam header `Authorization` pada request berikutnya.

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbnVzZXIiLCJyb2xlX2lkIjoxLCJpYXQiOjE2ODcyMzU4MTcsImV4cCI6MTY4NzIzOTQxN30.gWd1zV_7-oXbYxQZJzYJ5sA5xYjP3nF0P4QkM4gJ9Qc",
  "user": {
    "id": 1,
    "username": "adminuser",
    "email": "admin@example.com",
    "role_id": 1
  }
}
```

#### Contoh Respon Gagal (Status: 401 Unauthorized)

```json
{
  "message": "Invalid credentials"
}
```

---

## 3. Lupa Password

Endpoint ini digunakan untuk memproses permintaan lupa password (menggunakan data yang dikumpulkan dari frontend).

| Detail      | Deskripsi                        |
| :---------- | :------------------------------- |
| **URL**     | `/forgot-password`               |
| **Method**  | `POST`                           |
| **Headers** | `Content-Type: application/json` |

#### Body (Raw, JSON)

| Field        | Tipe   | Deskripsi                   | Wajib | Contoh                 |
| :----------- | :----- | :-------------------------- | :---- | :--------------------- |
| `npp`        | String | NPP pengguna                | Ya    | `"adminuser"`          |
| `ktp_number` | String | Nomor KTP/NIK               | Ya    | `"3273110001000001"`   |
| `email`      | String | Alamat email yang terdaftar | Ya    | `"asesi@pindad.co.id"` |

```json
{
  "npp": "12345678",
  "ktp_number": "3273110001000001",
  "email": "asesi@pindad.co.id"
}
```

#### Contoh Respon Sukses (Status: 200 OK)

Meskipun ini hanya simulasi, respon yang sukses menunjukkan bahwa proses validasi data telah terpenuhi.

```json
{
  "message": "Jika data ditemukan, link reset password telah dikirimkan ke email Anda."
}
```
