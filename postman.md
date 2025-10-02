# Dokumentasi API LSP Backend (Fastify + PostgreSQL)

**Base URL:** `http://localhost:3000/api`

## 1. Modul Autentikasi (`/api/auth`)

### 1.1. Pendaftaran Asesi (Public)

Mendaftarkan pengguna baru dengan peran `Asesi` dan membuat profil terkait.

| Metode | Endpoint               | Deskripsi                   |
| :----- | :--------------------- | :-------------------------- |
| `POST` | `/auth/register/asesi` | Pendaftaran pengguna Asesi. |

**Body (JSON)**

| Field          | Tipe     | Wajib | Deskripsi                                     |
| :------------- | :------- | :---- | :-------------------------------------------- |
| `username`     | `string` | Ya    | NPP (Nomor Pokok Pegawai) atau username unik. |
| `password`     | `string` | Ya    | Kata sandi.                                   |
| `email`        | `string` | Ya    | Alamat email unik.                            |
| `full_name`    | `string` | Ya    | Nama lengkap Asesi.                           |
| `ktp_number`   | `string` | Ya    | Nomor KTP/NIK unik.                           |
| `phone_number` | `string` | Tidak | Nomor telepon.                                |
| `address`      | `string` | Tidak | Alamat lengkap.                               |

**Contoh Request Body:**

```json
{
  "username": "asesi123",
  "password": "Password123",
  "email": "asesi@pindad.com",
  "full_name": "Bambang Santoso",
  "ktp_number": "3201011234567890",
  "phone_number": "081234567890",
  "address": "Jl. Raya Bandung No. 10"
}
```

**Contoh Response (201 Created):**

```json
{
  "message": "Asesi registered successfully",
  "user": {
    "id": 2,
    "username": "asesi123",
    "email": "asesi@pindad.com",
    "role_id": 2
  }
}
```

### 1.2. Pendaftaran Admin atau Asesor (Restricted Public)

Mendaftarkan pengguna baru dengan peran `Admin` atau `Asesor`. Membutuhkan `admin_secret` di body.

| Metode | Endpoint                    | Deskripsi                      |
| :----- | :-------------------------- | :----------------------------- |
| `POST` | `/auth/register/privileged` | Pendaftaran Admin atau Asesor. |

**Body (JSON)**

| Field          | Tipe     | Wajib           | Deskripsi                                                  |
| :------------- | :------- | :-------------- | :--------------------------------------------------------- |
| `admin_secret` | `string` | Ya              | Secret key yang dikonfigurasi di backend (`ADMIN_SECRET`). |
| `role_name`    | `string` | Ya              | Harus salah satu dari: `"Admin"` atau `"Asesor"`.          |
| `username`     | `string` | Ya              | Username unik.                                             |
| `password`     | `string` | Ya              | Kata sandi.                                                |
| `email`        | `string` | Ya              | Alamat email unik.                                         |
| `full_name`    | `string` | Ya              | Nama lengkap.                                              |
| `position`     | `string` | **Jika Admin**  | Posisi/Jabatan (contoh: Manager IT).                       |
| `reg_number`   | `string` | **Jika Asesor** | Nomor Registrasi Asesor.                                   |

**Contoh Request Body (Admin):**

```json
{
  "admin_secret": "YOUR_ADMIN_SECRET_KEY",
  "role_name": "Admin",
  "username": "adminpindad",
  "password": "StrongPassword123",
  "email": "admin@pindad.com",
  "full_name": "Adi Santoso",
  "position": "Kepala Divisi LSP"
}
```

### 1.3. Login

Autentikasi pengguna dan mendapatkan token JWT.

| Metode | Endpoint      | Deskripsi       |
| :----- | :------------ | :-------------- |
| `POST` | `/auth/login` | Login pengguna. |

**Body (JSON)**

| Field      | Tipe     | Wajib | Deskripsi              |
| :--------- | :------- | :---- | :--------------------- |
| `username` | `string` | Ya    | NPP/Username pengguna. |
| `password` | `string` | Ya    | Kata sandi pengguna.   |

**Contoh Response (200 OK):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "adminpindad",
    "email": "admin@pindad.com",
    "role_id": 1,
    "role_name": "Admin"
  }
}
```

### 1.4. Lupa Password

Mereset kata sandi dengan memverifikasi username dan email (simulasi).

| Metode | Endpoint                | Deskripsi       |
| :----- | :---------------------- | :-------------- |
| `POST` | `/auth/forgot-password` | Reset password. |

**Body (JSON)**

| Field          | Tipe     | Wajib | Deskripsi          |
| :------------- | :------- | :---- | :----------------- |
| `username`     | `string` | Ya    | Username pengguna. |
| `email`        | `string` | Ya    | Email terdaftar.   |
| `new_password` | `string` | Ya    | Kata sandi baru.   |

---

## 2. Modul Pengguna (`/api/users`)

Semua endpoint memerlukan header `Authorization: Bearer <token_jwt>`.

### 2.1. Mendapatkan Profil Sendiri

| Metode | Endpoint         | Deskripsi                                                                         |
| :----- | :--------------- | :-------------------------------------------------------------------------------- |
| `GET`  | `/users/profile` | Mendapatkan data akun dan profil (Asesi/Asesor/Admin) pengguna yang sedang login. |

**Contoh Response (200 OK - Role Asesi):**

```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": 2,
    "username": "asesi123",
    "email": "asesi@pindad.com",
    "roleId": 2,
    "roleName": "Asesi",
    "profileData": {
      "fullName": "Bambang Santoso",
      "phoneNumber": "081234567890",
      "address": "Jl. Raya Bandung No. 10",
      "ktpNumber": "3201011234567890"
    }
  }
}
```

### 2.2. Mengubah Password

| Metode | Endpoint                 | Deskripsi                                       |
| :----- | :----------------------- | :---------------------------------------------- |
| `POST` | `/users/change-password` | Mengubah kata sandi pengguna yang sedang login. |

**Body (JSON)**

| Field             | Tipe     | Wajib | Deskripsi            |
| :---------------- | :------- | :---- | :------------------- |
| `currentPassword` | `string` | Ya    | Kata sandi saat ini. |
| `newPassword`     | `string` | Ya    | Kata sandi baru.     |

---

## 3. Modul Lembaga Sertifikasi Profesi (`/api/lsps`)

Hanya role `Admin` yang diizinkan untuk CRUD (Create, Update, Delete). Read (GET) diizinkan untuk semua peran yang terautentikasi.

### 3.1. Create LSP

| Metode | Endpoint | Deskripsi              |
| :----- | :------- | :--------------------- |
| `POST` | `/lsps`  | Membuat data LSP baru. |

**Body (JSON - menggunakan camelCase):**

```json
{
  "namaLsp": "LSP Pindad Persero",
  "direkturLsp": "Dr. Ir. Budi Hartono",
  "jenisLsp": "P2",
  "alamat": "Jl. Gatot Subroto No. 517, Bandung",
  "telepon": "022-7312073",
  "email": "lsp@pindad.com",
  "website": "http://www.lsp-pindad.com"
}
```

### 3.2. Get All LSPs

| Metode | Endpoint | Deskripsi                                                  |
| :----- | :------- | :--------------------------------------------------------- |
| `GET`  | `/lsps`  | Mendapatkan daftar LSP (mendukung paginasi dan pencarian). |

**Query Parameters:**

| Parameter | Tipe     | Deskripsi                                           |
| :-------- | :------- | :-------------------------------------------------- |
| `search`  | `string` | Mencari berdasarkan `nama_lsp` atau `direktur_lsp`. |
| `page`    | `number` | Halaman yang diminta (default: 1).                  |
| `limit`   | `number` | Jumlah item per halaman (default: 10).              |

### 3.3. Get LSP by ID

| Metode | Endpoint    | Deskripsi               |
| :----- | :---------- | :---------------------- |
| `GET`  | `/lsps/:id` | Mendapatkan detail LSP. |

### 3.4. Update LSP

| Metode | Endpoint    | Deskripsi             |
| :----- | :---------- | :-------------------- |
| `PUT`  | `/lsps/:id` | Memperbarui data LSP. |

### 3.5. Delete LSP

| Metode   | Endpoint    | Deskripsi           |
| :------- | :---------- | :------------------ |
| `DELETE` | `/lsps/:id` | Menghapus data LSP. |

---

## 4. Modul Skema Sertifikasi (`/api/schemes`)

Hanya role `Admin` yang diizinkan untuk CRUD. Read (GET) diizinkan untuk semua peran yang terautentikasi.

### 4.1. Create Skema

| Metode | Endpoint   | Deskripsi                       |
| :----- | :--------- | :------------------------------ |
| `POST` | `/schemes` | Membuat Skema Sertifikasi baru. |

**Body (JSON - menggunakan custom camelCase):**

```json
{
  "kodeSkema": "SKM.01.P2.10.2024",
  "namaSkema": "Skema Sertifikasi Operator Mesin Bubut CNC Tingkat Dasar",
  "description": "Skema ini mencakup kompetensi dasar pengoperasian mesin bubut.",
  "skkni": "SKKNI No. 123 Tahun 2020",
  "keteranganBukti": "Portofolio, Hasil Uji Tulis, Hasil Praktik",
  "isActive": true
}
```

### 4.2. Get All Schemes

| Metode | Endpoint   | Deskripsi                             |
| :----- | :--------- | :------------------------------------ |
| `GET`  | `/schemes` | Mendapatkan daftar Skema Sertifikasi. |

### 4.3. Get Scheme by ID

| Metode | Endpoint       | Deskripsi                 |
| :----- | :------------- | :------------------------ |
| `GET`  | `/schemes/:id` | Mendapatkan detail Skema. |

### 4.4. Update Scheme

| Metode | Endpoint       | Deskripsi               |
| :----- | :------------- | :---------------------- |
| `PUT`  | `/schemes/:id` | Memperbarui data Skema. |

### 4.5. Delete Scheme

| Metode   | Endpoint       | Deskripsi             |
| :------- | :------------- | :-------------------- |
| `DELETE` | `/schemes/:id` | Menghapus data Skema. |

---

## 5. Modul Tempat Uji Kompetensi (`/api/tuks`)

Hanya role `Admin` yang diizinkan untuk CRUD. Read (GET) diizinkan untuk semua peran yang terautentikasi.

### 5.1. Create TUK

| Metode | Endpoint | Deskripsi              |
| :----- | :------- | :--------------------- |
| `POST` | `/tuks`  | Membuat data TUK baru. |

**Body (JSON - menggunakan custom camelCase):**

```json
{
  "kodeTuk": "TUK/001/PINDAD/2024",
  "namaTempat": "Workshop Pelatihan Utama Pindad",
  "jenisTuk": "Mandiri",
  "lspIndukId": 1,
  "penanggungJawab": "Ir. Susilo Bambang",
  "lisensi": "Lisensi BNSP No. 001/LSP/BNSP/2024",
  "skkni": "Sesuai SKKNI Logam",
  "jadwal": "Setiap Bulan Genap"
}
```

### 5.2. Get All TUKs

| Metode | Endpoint | Deskripsi               |
| :----- | :------- | :---------------------- |
| `GET`  | `/tuks`  | Mendapatkan daftar TUK. |

### 5.3. Get TUK by ID

| Metode | Endpoint    | Deskripsi                                         |
| :----- | :---------- | :------------------------------------------------ |
| `GET`  | `/tuks/:id` | Mendapatkan detail TUK (termasuk info LSP Induk). |

### 5.4. Update TUK

| Metode | Endpoint    | Deskripsi             |
| :----- | :---------- | :-------------------- |
| `PUT`  | `/tuks/:id` | Memperbarui data TUK. |

### 5.5. Delete TUK

| Metode   | Endpoint    | Deskripsi           |
| :------- | :---------- | :------------------ |
| `DELETE` | `/tuks/:id` | Menghapus data TUK. |

---

## 6. Modul Event Uji Kompetensi (EUK) (`/api/euks`)

Hanya role `Admin` yang diizinkan untuk CRUD. Read (GET) diizinkan untuk semua peran yang terautentikasi.

### 6.1. Create EUK

| Metode | Endpoint | Deskripsi                          |
| :----- | :------- | :--------------------------------- |
| `POST` | `/euks`  | Membuat Event Uji Kompetensi baru. |

**Body (JSON - menggunakan custom camelCase):**

```json
{
  "namaKegiatan": "Uji Kompetensi Batch 1 Mesin Bubut",
  "tanggal": "2024-10-20",
  "tempat": "TUK Workshop Utama",
  "alamat": "Jl. Industri No. 10",
  "jumlahPeserta": 25,
  "penanggungJawab": "Budi Rahardjo",
  "lspPenyelenggara": "LSP Pindad",
  "deskripsi": "Uji kompetensi untuk skema operator bubut dasar.",
  "status": "DRAFT",
  "schemeId": 1
}
```

### 6.2. Get All EUKs

| Metode | Endpoint | Deskripsi                                     |
| :----- | :------- | :-------------------------------------------- |
| `GET`  | `/euks`  | Mendapatkan daftar EUK (termasuk nama skema). |

### 6.3. Get EUK by ID

| Metode | Endpoint    | Deskripsi               |
| :----- | :---------- | :---------------------- |
| `GET`  | `/euks/:id` | Mendapatkan detail EUK. |

### 6.4. Update EUK

| Metode | Endpoint    | Deskripsi             |
| :----- | :---------- | :-------------------- |
| `PUT`  | `/euks/:id` | Memperbarui data EUK. |

### 6.5. Delete EUK

| Metode   | Endpoint    | Deskripsi           |
| :------- | :---------- | :------------------ |
| `DELETE` | `/euks/:id` | Menghapus data EUK. |
