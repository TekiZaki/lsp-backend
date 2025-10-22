# LSP Backend API

Backend untuk sistem manajemen **Lembaga Sertifikasi Profesi (LSP)** menggunakan **Node.js**, **Fastify**, **PostgreSQL**, dan **JWT Authentication**.
Proyek ini menyediakan API untuk autentikasi, manajemen user, serta CRUD data **LSP, TUK, EUK, Skema Sertifikasi, Unit Kompetensi, Asesi, Biaya, Rekening, SMS, Konten Website, dan Notifikasi**.

---

## 🚀 Tech Stack

- **Node.js + Fastify** → Framework server-side
- **PostgreSQL** → Database utama
- **JWT (JSON Web Token)** → Autentikasi
- **bcryptjs** → Enkripsi password
- **dotenv** → Manajemen konfigurasi environment
- **pg** → PostgreSQL client for Node.js
- **@fastify/cors** → CORS support for Fastify

---

## 📂 Struktur Proyek

```
lsp-backend/
├── app.js                # Inisialisasi aplikasi Fastify, registrasi routes dan CORS
├── server.js             # Entry point server, konfigurasi dotenv, network IP dan port
├── config/               # Konfigurasi database (database.js) & JWT (jwt.js)
├── middlewares/          # Middleware autentikasi (authMiddleware.js) & otorisasi (authorizeMiddleware.js)
├── models/               # Query database, fungsi-fungsi model global (globalModel.js)
├── modules/              # Feature Modules (Auth, User, LSP, TUK, EUK, Skema, Asesi, Biaya, Rekening, SMS, Verifikasi, WebsiteContent, Notification)
│   ├── auth/             # Modul Autentikasi
│   ├── user/             # Modul User
│   ├── lsp/              # Modul LSP
│   ├── tuk/              # Modul TUK
│   ├── euk/              # Modul EUK
│   ├── scheme/           # Modul Skema Sertifikasi
│   ├── asesi/            # Modul Asesi
│   ├── biaya/            # Modul Biaya
│   ├── rekening/         # Modul Rekening
│   ├── sms/              # Modul SMS
│   ├── verifikasi/       # Modul Verifikasi
│   ├── websiteContent/   # Modul Konten Website
│   └── notification/     # Modul Notifikasi
├── utils/                # Helper (DB & JWT utils, Data Mappers)
├── sql.sql               # File SQL untuk inisialisasi database (schema & dummy data)
└── README.md             # Dokumen ini
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
HOST=0.0.0.0 # opsional, untuk mengizinkan akses dari luar localhost
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

3. **Setup Database**
   - Jalankan PostgreSQL dan buat database `lspdb` (atau sesuai dengan `DATABASE_URL` Anda).
   - Import schema database dari `sql.sql`:

     ```bash
     psql -U <username> -d lspdb -f sql.sql
     ```
     Ganti `<username>` dengan username PostgreSQL Anda.

4. **Jalankan server**

   ```bash
   npm start
   ```

   Server akan berjalan di `http://localhost:3000`. Cek di console untuk alamat network yang lain.

---

## 📌 Dokumentasi API

Berikut ringkasan endpoint API:

### 🔑 Modul Autentikasi (`/api/auth`)

- `POST /auth/register/asesi` → Pendaftaran Asesi (public).
- `POST /auth/register/privileged` → Pendaftaran Admin/Asesor (require `ADMIN_SECRET`).
- `POST /auth/login` → Login pengguna.
- `POST /auth/forgot-password` → Reset password (memerlukan verifikasi email - simulasi).

### 👤 Modul User (`/api/users`)

- `GET /users/profile` → Ambil data profil user (require JWT).
- `POST /users/change-password` → Ganti password (require JWT).

### 🏢 Modul LSP (`/api/lsps`)

- `GET /lsps` → Ambil semua LSP (auth required).
- `GET /lsps/:id` → Detail LSP (auth required).
- `POST /lsps` → Tambah LSP (**Admin only**).
- `PUT /lsps/:id` → Update LSP (**Admin only**).
- `DELETE /lsps/:id` → Hapus LSP (**Admin only**).

### 📜 Modul Skema Sertifikasi (`/api/schemes`)

- `GET /schemes` → Ambil semua skema sertifikasi (auth required).
- `GET /schemes/:id` → Detail skema (auth required).
- `POST /schemes` → Tambah skema (**Admin only**).
- `PUT /schemes/:id` → Update skema (**Admin only**).
- `DELETE /schemes/:id` → Hapus skema (**Admin only**).

### 🏫 Modul TUK (`/api/tuks`)

- `GET /tuks` → Ambil semua TUK (auth required).
- `GET /tuks/:id` → Detail TUK (auth required).
- `POST /tuks` → Tambah TUK (**Admin only**).
- `PUT /tuks/:id` → Update TUK (**Admin only**).
- `DELETE /tuks/:id` → Hapus TUK (**Admin only**).

### 📅 Modul EUK (`/api/euks`)

- `GET /euks` → Ambil semua event uji kompetensi (auth required).
- `GET /euks/:id` → Detail EUK (auth required).
- `POST /euks` → Tambah EUK (**Admin only**).
- `PUT /euks/:id` → Update EUK (**Admin only**).
- `DELETE /euks/:id` → Hapus EUK (**Admin only**).

### 🧑‍🎓 Modul Asesi (`/api/asesi`)

- **PUBLIC**:
  - `GET /asesi/public/provinces` → Daftar provinsi dengan jumlah asesi.
  - `GET /asesi/public/provinces/:provinsiId/cities` → Daftar kota berdasarkan provinsi.
  - `GET /asesi/public/cities/:kotaId/asesi` → Daftar asesi berdasarkan kota.
- **ADMIN**:
  - `GET /asesi` → Ambil semua asesi (dengan filter opsional, Admin only).
  - `GET /asesi/:id` → Detail asesi (Admin only).
  - `POST /asesi` → Tambah asesi (Admin only).
  - `PUT /asesi/:id` → Update asesi (Admin only).
  - `DELETE /asesi/:id` → Hapus asesi (Admin only).
  - `POST /asesi/import` → Import asesi dari file (Admin only).
  - `PATCH /asesi/:id/verify` → Verifikasi asesi (Admin only).
  - `PATCH /asesi/:id/block` → Blokir asesi (Admin only).
  - `PATCH /asesi/:id/unblock` → Buka blokir asesi (Admin only).

### 💰 Modul Biaya (`/api/biaya`)

- `GET /biaya` → Ambil semua biaya (Admin only).
- `GET /biaya/:id` → Detail biaya (Admin only).
- `POST /biaya` → Tambah biaya (**Admin only**).
- `PUT /biaya/:id` → Update biaya (**Admin only**).
- `DELETE /biaya/:id` → Hapus biaya (**Admin only**).

### 🏦 Modul Rekening (`/api/rekening`)

- `GET /rekening` → Ambil semua rekening (Admin only).
- `POST /rekening` → Tambah rekening (**Admin only**).
- `PUT /rekening/:id` → Update rekening (**Admin only**).
- `DELETE /rekening/:id` → Hapus rekening (**Admin only**).

### 💬 Modul SMS (`/api/sms`)

- `GET /sms/masuk` → SMS Masuk (Admin only).
- `GET /sms/keluar` → SMS Keluar (Admin only).
- `POST /sms/kirim` → Kirim SMS (Admin only).

### ✅ Modul Verifikasi (`/api/verifikasi`)

- `GET /verifikasi/data/:asesiId` → Data verifikasi untuk Asesi (Admin Only).

### 🌐 Modul Website Content (`/api/website-content`)

- `GET /website-content` → Ambil semua konten website (public).
- `GET /website-content/:id` → Detail konten website (public).
- `POST /website-content` → Tambah konten website (**Admin only**).
- `PUT /website-content/:id` → Update konten website (**Admin only**).
- `DELETE /website-content/:id` → Hapus konten website (**Admin only**).

### 🔔 Modul Notifications (`/api/notifications`)

- `GET /notifications` → Get all notifications (auth required).
- `GET /notifications/:id` → Get notification by ID (auth required).
- `PATCH /notifications/:id/read` → Mark notification as read (auth required).

### 📅 Modul Jadwal Uji Kompetensi (JUK) (`/api/juks`)
- `GET /juks` → Ambil semua jadwal uji kompetensi (auth required).
- `GET /juks/:id` → Detail jadwal uji kompetensi (auth required).
- `POST /juks` → Tambah jadwal uji kompetensi (**Admin only**).
- `PUT /juks/:id` → Update jadwal uji kompetensi (**Admin only**).
- `DELETE /juks/:id` → Hapus jadwal uji kompetensi (**Admin only**).

### 🧑‍🎓 Modul Peserta Uji Kompetensi (PUK) (`/api/puks`)
- `GET /puks/jadwal/:jadwalId/peserta` → Dapatkan daftar peserta berdasarkan jadwal (auth required).
- `POST /puks/jadwal/:jadwalId/peserta` → Tambahkan peserta ke jadwal (Admin only).
- `DELETE /puks/jadwal/:jadwalId/peserta/:pesertaId` → Hapus peserta dari jadwal (Admin only).

### 📚 Modul Unit Kompetensi (UK) (`/api/units`)
- `GET /units` → Ambil semua unit kompetensi (auth required, schemeId optional).
- `GET /units/:id` → Detail unit kompetensi termasuk elemen & kuk (auth required).
- `POST /units` → Tambah unit kompetensi (**Admin only**).
- `POST /units/:unitId/elemen` → Tambah elemen kompetensi (**Admin only**).
- `POST /units/elemen/:elemenId/kuk` → Tambah kriteria unjuk kerja (**Admin only**).

---

## 🔒 Middleware

- **authMiddleware** → Validasi JWT token.
- **authorizeMiddleware** → Batasi akses berdasarkan role (misalnya: Admin, Asesi, Asesor).

---

## 🛠️ Database

### Tabel utama yang digunakan:

- **roles** (id, name)
- **users** (id, username, password, email, role_id, created_at, updated_at)
- **asesi_profiles** (informasi detail asesi)
- **asesor_profiles** (informasi detail asesor)
- **admin_profiles** (informasi detail admin)
- **lsp_institutions** (informasi detail LSP)
- **tempat_uji_kompetensi** (TUK) (informasi lokasi uji)
- **events** (EUK/JUK) (event uji kompetensi, jadwal, terkait skema & LSP)
- **certification_schemes** (Skema) (informasi skema sertifikasi)
- **unit_kompetensi** (unit kompetensi terkait skema)
- **elemen_kompetensi** (elemen kompetensi terkait unit)
- **kriteria_unjuk_kerja** (KUK) (kriteria unjuk kerja terkait elemen)
- **event_participants** (peserta uji kompetensi dalam event)
- **biaya** (biaya sertifikasi)
- **rekening** (informasi rekening bank)
- **sms_masuk** (SMS masuk)
- **sms_keluar** (SMS keluar)
- **persyaratan_skema** (persyaratan untuk skema)
- **dokumen_asesi** (dokumen yang diunggah asesi)
- **jadwal_asesmen** (jadwal asesmen yang tersedia)
- **website_content** (konten website)
- **notifications** (notifikasi)
