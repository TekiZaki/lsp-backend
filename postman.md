Okay, here are the API documentation details for your `lsp-supabase` backend, formatted for testing with Postman.

**Base URL:** `http://localhost:3000/api`

---

## 1. Authentication & Authorization

### 1.1 Register Asesi (Public)

`POST /auth/register/asesi`

**Description:** Registers a new Asesi user.
**Body (JSON):**

```json
{
  "username": "asesi_username",
  "password": "asesi_password123",
  "email": "asesi@example.com",
  "full_name": "Nama Lengkap Asesi",
  "ktp_number": "1234567890123456",
  "phone_number": "081234567890",
  "address": "Jalan Asesi No. 1, Kota Asesi, Provinsi Asesi"
}
```

**Responses:**

- `201 Created`: `{ "message": "Asesi registered successfully", "user": { ... } }`
- `400 Bad Request`: `{ "message": "Required fields are missing" }`
- `409 Conflict`: `{ "message": "Username (NPP) already taken" }`
- `500 Internal Server Error`

---

### 1.2 Register Admin/Asesor (Restricted, requires `admin_secret`)

`POST /auth/register/privileged`

**Description:** Registers a new Admin or Asesor user. Requires a specific secret key.
**Body (JSON):**

- **For Admin:**
  ```json
  {
    "username": "admin_user",
    "password": "admin_password123",
    "email": "admin@example.com",
    "role_name": "Admin",
    "admin_secret": "YOUR_ADMIN_SECRET_FROM_ENV",
    "full_name": "Nama Lengkap Admin",
    "position": "Manager LSP"
  }
  ```
- **For Asesor:**
  `json
    {
      "username": "asesor_user",
      "password": "asesor_password123",
      "email": "asesor@example.com",
      "role_name": "Asesor",
      "admin_secret": "YOUR_ADMIN_SECRET_FROM_ENV",
      "full_name": "Nama Lengkap Asesor",
      "reg_number": "REG-ASR-001"
    }
    `
  **Note:** Replace `"YOUR_ADMIN_SECRET_FROM_ENV"` with the actual value from your `.env` file (e.g., `process.env.ADMIN_SECRET`).
  **Responses:**
- `201 Created`: `{ "message": "Admin/Asesor registered successfully", "user": { ... } }`
- `400 Bad Request`: `{ "message": "Required fields are missing" }`, `{ "message": "Invalid role_name specified" }`, `{ "message": "Position is required for Admin" }`, etc.
- `403 Forbidden`: `{ "message": "Invalid admin secret key" }`
- `409 Conflict`: `{ "message": "Username already taken" }`
- `500 Internal Server Error`

---

### 1.3 Login

`POST /auth/login`

**Description:** Authenticates a user and returns a JWT token.
**Body (JSON):**

```json
{
  "username": "asesi_user",
  "password": "asesi_password123"
}
```

**Responses:**

- `200 OK`:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "username": "asesi_user",
      "email": "asesi@example.com",
      "role_id": 2,
      "role_name": "Asesi"
    }
  }
  ```
- `400 Bad Request`: `{ "message": "Username (NPP) and password are required" }`
- `401 Unauthorized`: `{ "message": "Invalid credentials" }`
- `500 Internal Server Error`

**Note:** Copy the `token` from a successful login response. You will use it in the `Authorization` header for protected routes: `Bearer <your_token_here>`.

---

### 1.4 Forgot Password

`POST /auth/forgot-password`

**Description:** Resets a user's password given their username and email.
**Body (JSON):**

```json
{
  "username": "asesi_user",
  "email": "asesi@example.com",
  "new_password": "new_secure_password123"
}
```

**Responses:**

- `200 OK`: `{ "message": "Password has been successfully reset. Please log in with your new password." }`
- `400 Bad Request`: `{ "message": "Username, email, and new password are required" }`
- `401 Unauthorized`: `{ "message": "Invalid username or email verification." }`
- `500 Internal Server Error`

---

## 2. User Management (Authenticated)

**All routes below require an `Authorization` header:** `Bearer <your_jwt_token>`

### 2.1 Get My Profile

`GET /users/profile`

**Description:** Retrieves the authenticated user's profile details.
**Responses:**

- `200 OK`:
  ```json
  {
    "message": "User profile retrieved successfully",
    "user": {
      "id": 1,
      "username": "asesi_user",
      "email": "asesi@example.com",
      "roleId": 2,
      "roleName": "Asesi",
      "profileData": {
        "fullName": "Nama Lengkap Asesi",
        "phoneNumber": "081234567890",
        "address": "Jalan Asesi No. 1, Kota Asesi, Provinsi Asesi",
        "ktpNumber": "1234567890123456"
      }
    }
  }
  ```
- `401 Unauthorized`: `{ "message": "Authorization token required" }`, `{ "message": "Invalid or expired token" }`
- `404 Not Found`: `{ "message": "User not found" }`
- `500 Internal Server Error`

---

### 2.2 Change Password

`POST /users/change-password`

**Description:** Allows an authenticated user to change their password.
**Body (JSON):**

```json
{
  "currentPassword": "asesi_password123",
  "newPassword": "strong_new_password_456"
}
```

**Responses:**

- `200 OK`: `{ "message": "Password updated successfully" }`
- `400 Bad Request`: `{ "message": "Current password and new password are required" }`
- `401 Unauthorized`: `{ "message": "Incorrect current password" }`, `{ "message": "Authorization token required" }`, etc.
- `404 Not Found`: `{ "message": "User not found or mismatch" }`
- `500 Internal Server Error`

---

## 3. LSP Institutions (Lembaga Sertifikasi Profesi)

**All routes below require an `Authorization` header:** `Bearer <your_jwt_token>`
_(Admin role required for POST, PUT, DELETE)_

### 3.1 Get All LSPs

`GET /lsps`

**Description:** Retrieves a list of all LSP institutions.
**Query Parameters (Optional):**

- `search`: Filter by LSP name or director.
- `page`: Page number (default: 1).
- `limit`: Items per page (default: 10).
  **Responses:**
- `200 OK`:
  ```json
  {
    "message": "LSPs retrieved successfully",
    "data": [
      {
        "id": 1,
        "namaLsp": "LSP Komputer",
        "direkturLsp": "Budi Santoso",
        "jenisLsp": "Pihak 3",
        "alamat": "Jl. Merdeka No. 10",
        "telepon": "021-123456",
        "email": "info@lspkom.co.id",
        "website": "www.lspkom.co.id",
        "createdAt": "2023-10-26T10:00:00.000Z",
        "updatedAt": "2023-10-26T10:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
  ```
- `401 Unauthorized`
- `500 Internal Server Error`

---

### 3.2 Get LSP by ID

`GET /lsps/:id`

**Description:** Retrieves details of a single LSP institution by its ID.
**Path Parameters:**

- `id`: The ID of the LSP.
  **Responses:**
- `200 OK`: `{ "message": "LSP retrieved successfully", "lsp": { ... } }` (same format as single item in `GET /lsps` data)
- `401 Unauthorized`
- `404 Not Found`: `{ "message": "LSP not found" }`
- `500 Internal Server Error`

---

### 3.3 Create LSP (Admin Only)

`POST /lsps`

**Description:** Creates a new LSP institution.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON):**

```json
{
  "namaLsp": "LSP Digital Kreatif",
  "direkturLsp": "Siti Aminah",
  "jenisLsp": "Pihak 1",
  "alamat": "Jl. Kreatif No. 5",
  "telepon": "021-789012",
  "email": "info@lspdk.co.id",
  "website": "www.lspdk.co.id"
}
```

**Responses:**

- `201 Created`: `{ "message": "LSP created successfully", "lsp": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 3.4 Update LSP (Admin Only)

`PUT /lsps/:id`

**Description:** Updates an existing LSP institution.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the LSP to update.
  **Body (JSON):**

```json
{
  "namaLsp": "LSP Digital Inovatif",
  "direkturLsp": "Siti Aminah Wijaya",
  "telepon": "021-7890123"
}
```

**Responses:**

- `200 OK`: `{ "message": "LSP updated successfully", "lsp": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "LSP not found" }`
- `500 Internal Server Error`

---

### 3.5 Delete LSP (Admin Only)

`DELETE /lsps/:id`

**Description:** Deletes an LSP institution.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the LSP to delete.
  **Responses:**
- `200 OK`: `{ "message": "LSP deleted successfully", "id": 1 }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "LSP not found" }`
- `500 Internal Server Error`

---

## 4. Certification Schemes (Skema Sertifikasi)

**All routes below require an `Authorization` header:** `Bearer <your_jwt_token>`
_(Admin role required for POST, PUT, DELETE)_

### 4.1 Get All Schemes

`GET /schemes`

**Description:** Retrieves a list of all certification schemes.
**Query Parameters (Optional):**

- `search`: Filter by scheme name, code, or SKKNI.
- `page`: Page number (default: 1).
- `limit`: Items per page (default: 10).
  **Responses:**
- `200 OK`:
  ```json
  {
    "message": "Schemes retrieved successfully",
    "data": [
      {
        "id": 1,
        "kodeSkema": "SKM-02-LSP Batik",
        "namaSkema": "PEMBUATAN BATIK TULIS",
        "skkni": "SKKNI No.XXX",
        "keteranganBukti": "Bukti portofolio, hasil karya",
        "isActive": true,
        "persyaratanCount": 0
      }
    ],
    "pagination": { ... }
  }
  ```
- `401 Unauthorized`
- `500 Internal Server Error`

---

### 4.2 Get Scheme by ID

`GET /schemes/:id`

**Description:** Retrieves details of a single certification scheme by its ID.
**Path Parameters:**

- `id`: The ID of the scheme.
  **Responses:**
- `200 OK`: `{ "message": "Skema retrieved successfully", "data": { ... } }` (same format as single item in `GET /schemes` data)
- `401 Unauthorized`
- `404 Not Found`: `{ "message": "Skema not found" }`
- `500 Internal Server Error`

---

### 4.3 Create Scheme (Admin Only)

`POST /schemes`

**Description:** Creates a new certification scheme.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON):**

```json
{
  "kodeSkema": "SKM-05-LSP Jaringan",
  "namaSkema": "Pemasangan Jaringan Komputer",
  "description": "Skema untuk pemasangan dan konfigurasi jaringan.",
  "skkni": "SKKNI No.YYY",
  "keteranganBukti": "Laporan instalasi, hasil tes jaringan",
  "isActive": true
}
```

**Responses:**

- `201 Created`: `{ "message": "Skema created successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 4.4 Update Scheme (Admin Only)

`PUT /schemes/:id`

**Description:** Updates an existing certification scheme.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the scheme to update.
  **Body (JSON):**

```json
{
  "namaSkema": "Pemasangan dan Konfigurasi Jaringan Komputer",
  "isActive": false
}
```

**Responses:**

- `200 OK`: `{ "message": "Skema updated successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Skema not found" }`
- `500 Internal Server Error`

---

### 4.5 Delete Scheme (Admin Only)

`DELETE /schemes/:id`

**Description:** Deletes a certification scheme.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the scheme to delete.
  **Responses:**
- `200 OK`: `{ "message": "Skema deleted successfully", "id": 1 }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Skema not found" }`
- `500 Internal Server Error`

---

## 5. Event Uji Kompetensi (EUK)

**All routes below require an `Authorization` header:** `Bearer <your_jwt_token>`
_(Admin role required for POST, PUT, DELETE)_

### 5.1 Get All EUKs

`GET /euks`

**Description:** Retrieves a list of all Event Uji Kompetensi.
**Query Parameters (Optional):**

- `search`: Filter by event name, location, or PIC.
- `page`: Page number (default: 1).
- `limit`: Items per page (default: 10).
  **Responses:**
- `200 OK`:
  ```json
  {
    "message": "EUKs retrieved successfully",
    "data": [
      {
        "id": 1,
        "namaKegiatan": "Uji Kompetensi Junior Web Dev Batch 1",
        "tanggal": "2024-06-15",
        "tempat": "Gedung Serbaguna A",
        "alamat": "Jl. Contoh No.123",
        "jumlahPeserta": 50,
        "penanggungJawab": "Budi Hartono",
        "lspPenyelenggara": "LSP WEB",
        "deskripsi": "Uji kompetensi untuk skema Junior Web Developer.",
        "status": "Terbuka",
        "schemeId": 3,
        "createdAt": "2024-05-01T08:00:00.000Z",
        "updatedAt": "2024-05-01T08:00:00.000Z",
        "schemeName": "JUNIOR WEB DEVELOPER"
      }
    ],
    "pagination": { ... }
  }
  ```
- `401 Unauthorized`
- `500 Internal Server Error`

---

### 5.2 Get EUK by ID

`GET /euks/:id`

**Description:** Retrieves details of a single Event Uji Kompetensi by its ID.
**Path Parameters:**

- `id`: The ID of the EUK.
  **Responses:**
- `200 OK`: `{ "message": "EUK retrieved successfully", "data": { ... } }` (same format as single item in `GET /euks` data)
- `401 Unauthorized`
- `404 Not Found`: `{ "message": "EUK not found" }`
- `500 Internal Server Error`

---

### 5.3 Create EUK (Admin Only)

`POST /euks`

**Description:** Creates a new Event Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON):**

```json
{
  "namaKegiatan": "Uji Kompetensi Pembuatan Batik Cap Batch 2",
  "tanggal": "2024-07-20",
  "tempat": "Workshop Batik Lestari",
  "alamat": "Jl. Batik Indah No. 5",
  "jumlahPeserta": 30,
  "penanggungJawab": "Indra Wijaya",
  "lspPenyelenggara": "LSP Batik",
  "deskripsi": "Uji kompetensi untuk skema Pembuatan Batik Cap.",
  "status": "Terbuka",
  "schemeId": 2
}
```

**Responses:**

- `201 Created`: `{ "message": "EUK created successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 5.4 Update EUK (Admin Only)

`PUT /euks/:id`

**Description:** Updates an existing Event Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the EUK to update.
  **Body (JSON):**

```json
{
  "namaKegiatan": "Uji Kompetensi Pembuatan Batik Cap Batch 2 (Revisi)",
  "jumlahPeserta": 35,
  "status": "Ditutup"
}
```

**Responses:**

- `200 OK`: `{ "message": "EUK updated successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "EUK not found" }`
- `500 Internal Server Error`

---

### 5.5 Delete EUK (Admin Only)

`DELETE /euks/:id`

**Description:** Deletes an Event Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the EUK to delete.
  **Responses:**
- `200 OK`: `{ "message": "EUK deleted successfully", "id": 1 }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "EUK not found" }`
- `500 Internal Server Error`

---

## 6. Tempat Uji Kompetensi (TUK)

**All routes below require an `Authorization` header:** `Bearer <your_jwt_token>`
_(Admin role required for POST, PUT, DELETE)_

### 6.1 Get All TUKs

`GET /tuks`

**Description:** Retrieves a list of all Tempat Uji Kompetensi.
**Query Parameters (Optional):**

- `search`: Filter by TUK name, code, PIC, or parent LSP.
- `page`: Page number (default: 1).
- `limit`: Items per page (default: 10).
  **Responses:**
- `200 OK`:
  ```json
  {
    "message": "TUKs retrieved successfully",
    "data": [
      {
        "id": 1,
        "kodeTuk": "TUK-001-BTL",
        "namaTempat": "BLKK Batik Tulis Lestari",
        "jenisTuk": "Mandiri",
        "penanggungJawab": "Nurul Hidayah",
        "lisensi": "Lisensi No. L-001/BNSP/2023",
        "skkni": "Bidang Batik",
        "jadwal": "Setiap hari kerja",
        "lspIndukId": null,
        "lspInduk": null,
        "lspJenis": null
      }
    ],
    "pagination": { ... }
  }
  ```
- `401 Unauthorized`
- `500 Internal Server Error`

---

### 6.2 Get TUK by ID

`GET /tuks/:id`

**Description:** Retrieves details of a single Tempat Uji Kompetensi by its ID.
**Path Parameters:**

- `id`: The ID of the TUK.
  **Responses:**
- `200 OK`: `{ "message": "TUK retrieved successfully", "data": { ... } }` (same format as single item in `GET /tuks` data)
- `401 Unauthorized`
- `404 Not Found`: `{ "message": "TUK not found" }`
- `500 Internal Server Error`

---

### 6.3 Create TUK (Admin Only)

`POST /tuks`

**Description:** Creates a new Tempat Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON):**

```json
{
  "kodeTuk": "TUK-002-SMK-TI",
  "namaTempat": "SMK Teknologi Informasi Bandung",
  "jenisTuk": "Sewaktu",
  "lspIndukId": 1,
  "penanggungJawab": "Agus Setiawan",
  "lisensi": "Lisensi No. L-002/BNSP/2023",
  "skkni": "Bidang IT",
  "jadwal": "Sesuai permintaan"
}
```

**Responses:**

- `201 Created`: `{ "message": "TUK created successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 6.4 Update TUK (Admin Only)

`PUT /tuks/:id`

**Description:** Updates an existing Tempat Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the TUK to update.
  **Body (JSON):**

```json
{
  "namaTempat": "SMK Teknologi Informasi Bandung (Pusat)",
  "jenisTuk": "Mandiri"
}
```

**Responses:**

- `200 OK`: `{ "message": "TUK updated successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "TUK not found" }`
- `500 Internal Server Error`

---

### 6.5 Delete TUK (Admin Only)

`DELETE /tuks/:id`

**Description:** Deletes a Tempat Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the TUK to delete.
  **Responses:**
- `200 OK`: `{ "message": "TUK deleted successfully", "id": 1 }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "TUK not found" }`
- `500 Internal Server Error`

---

## 7. Jadwal Uji Kompetensi (JUK)

**All routes below require an `Authorization` header:** `Bearer <your_jwt_token>`
_(Admin role required for POST, PUT, DELETE)_

### 7.1 Get All JUKs

`GET /juks`

**Description:** Retrieves a list of all Jadwal Uji Kompetensi.
**Query Parameters (Optional):**

- `search`: Filter by activity title, scheme name, or TUK name.
- `page`: Page number (default: 1).
- `limit`: Items per page (default: 10).
  **Responses:**
- `200 OK`:
  ```json
  {
    "message": "JUKs retrieved successfully",
    "data": [
      {
        "id": 1,
        "judulKegiatan": "Jadwal Uji Web Dev",
        "tanggalPelaksanaan": "2024-06-15",
        "jamPelaksanaan": "09:00 - 16:00",
        "kuotaPeserta": 25,
        "schemeId": 3,
        "tukId": 1,
        "asesorId": null,
        "nomorSuratTugas": "ST-001/LSP-WEB/2024",
        "namaSkema": "JUNIOR WEB DEVELOPER",
        "kodeTuk": "TUK-002-SMK-TI",
        "namaTuk": "SMK Teknologi Informasi Bandung",
        "namaAsesor": null,
        "regAsesor": null
      }
    ],
    "pagination": { ... }
  }
  ```
- `401 Unauthorized`
- `500 Internal Server Error`

---

### 7.2 Get JUK by ID

`GET /juks/:id`

**Description:** Retrieves details of a single Jadwal Uji Kompetensi by its ID.
**Path Parameters:**

- `id`: The ID of the JUK.
  **Responses:**
- `200 OK`: `{ "message": "JUK retrieved successfully", "data": { ... } }` (same format as single item in `GET /juks` data)
- `401 Unauthorized`
- `404 Not Found`: `{ "message": "Jadwal Uji Kompetensi not found" }`
- `500 Internal Server Error`

---

### 7.3 Create JUK (Admin Only)

`POST /juks`

**Description:** Creates a new Jadwal Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON):**

```json
{
  "judulKegiatan": "Jadwal Uji Batik Tulis",
  "tanggalPelaksanaan": "2024-08-10",
  "jamPelaksanaan": "08:00 - 17:00",
  "kuotaPeserta": 20,
  "schemeId": 1,
  "tukId": 1,
  "asesorId": null,
  "nomorSuratTugas": "ST-002/LSP-BATIK/2024"
}
```

**Responses:**

- `201 Created`: `{ "message": "Jadwal Uji Kompetensi created successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 7.4 Update JUK (Admin Only)

`PUT /juks/:id`

**Description:** Updates an existing Jadwal Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the JUK to update.
  **Body (JSON):**

```json
{
  "kuotaPeserta": 25,
  "jamPelaksanaan": "09:00 - 16:00"
}
```

**Responses:**

- `200 OK`: `{ "message": "JUK updated successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Jadwal Uji Kompetensi not found" }`
- `500 Internal Server Error`

---

### 7.5 Delete JUK (Admin Only)

`DELETE /juks/:id`

**Description:** Deletes a Jadwal Uji Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the JUK to delete.
  **Responses:**
- `200 OK`: `{ "message": "JUK deleted successfully", "id": 1 }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Jadwal Uji Kompetensi not found" }`
- `500 Internal Server Error`

---

## 8. Unit Kompetensi (UK), Elemen, and KUK

**All routes below require an `Authorization` header:** `Bearer <your_jwt_token>`
_(Admin role required for POST)_

### 8.1 Get All Units

`GET /units`

**Description:** Retrieves a list of all Unit Kompetensi.
**Query Parameters (Optional):**

- `search`: Filter by unit name or code.
- `schemeId`: Filter by a specific certification scheme ID.
- `page`: Page number (default: 1).
- `limit`: Items per page (default: 10).
  **Responses:**
- `200 OK`:
  ```json
  {
    "message": "Units retrieved successfully",
    "data": [
      {
        "id": 1,
        "kodeUnit": "UK.BATIK.01",
        "namaUnit": "Melakukan Persiapan Membatik Tulis",
        "jenisStandar": "SKKNI",
        "schemeId": 1,
        "skemaKode": "SKM-02-LSP Batik",
        "skemaNama": "PEMBUATAN BATIK TULIS",
        "elemenCount": 2,
        "kriteriaCount": 5
      }
    ],
    "pagination": { ... }
  }
  ```
- `401 Unauthorized`
- `500 Internal Server Error`

---

### 8.2 Get Unit Detail (with Elemen & KUK)

`GET /units/:id`

**Description:** Retrieves a single Unit Kompetensi with its associated Elemen Kompetensi and Kriteria Unjuk Kerja.
**Path Parameters:**

- `id`: The ID of the Unit Kompetensi.
  **Responses:**
- `200 OK`:
  ```json
  {
    "message": "Unit detail retrieved successfully",
    "data": {
      "id": 1,
      "kodeUnit": "UK.BATIK.01",
      "namaUnit": "Melakukan Persiapan Membatik Tulis",
      "jenisStandar": "SKKNI",
      "schemeId": 1,
      "skemaKode": "SKM-02-LSP Batik",
      "skemaNama": "PEMBUATAN BATIK TULIS",
      "elemenKompetensi": [
        {
          "id": 101,
          "unitId": 1,
          "namaElemen": "Menyiapkan alat dan bahan membatik",
          "kriteriaUnjukKerja": [
            {
              "id": 201,
              "elemenId": 101,
              "deskripsi": "Alat disiapkan sesuai prosedur."
            },
            {
              "id": 202,
              "elemenId": 101,
              "deskripsi": "Bahan disiapkan sesuai kebutuhan."
            }
          ]
        },
        {
          "id": 102,
          "unitId": 1,
          "namaElemen": "Melakukan pewarnaan dasar",
          "kriteriaUnjukKerja": [
            {
              "id": 203,
              "elemenId": 102,
              "deskripsi": "Warna dasar diaplikasikan secara merata."
            }
          ]
        }
      ]
    }
  }
  ```
- `401 Unauthorized`
- `404 Not Found`: `{ "message": "Unit Kompetensi not found" }`
- `500 Internal Server Error`

---

### 8.3 Create Unit (Admin Only)

`POST /units`

**Description:** Creates a new Unit Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON):**

```json
{
  "schemeId": 3,
  "kodeUnit": "UK.WEB.01",
  "namaUnit": "Mengaplikasikan Logika Pemrograman",
  "jenisStandar": "SKKNI"
}
```

**Responses:**

- `201 Created`: `{ "message": "Unit Kompetensi created successfully", "data": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 8.4 Create Elemen Kompetensi (Admin Only)

`POST /units/:unitId/elemen`

**Description:** Creates a new Elemen Kompetensi for a given Unit.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `unitId`: The ID of the parent Unit Kompetensi.
  **Body (JSON):**

```json
{
  "namaElemen": "Membuat algoritma sederhana"
}
```

**Responses:**

- `201 Created`: `{ "message": "Elemen Kompetensi created successfully", "data": { "id": 1, "namaElemen": "..." } }`
- `400 Bad Request`: `{ "message": "namaElemen is required" }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 8.5 Create Kriteria Unjuk Kerja (KUK) (Admin Only)

`POST /units/elemen/:elemenId/kuk`

**Description:** Creates a new Kriteria Unjuk Kerja for a given Elemen Kompetensi.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `elemenId`: The ID of the parent Elemen Kompetensi.
  **Body (JSON):**

```json
{
  "deskripsi": "Algoritma dirancang sesuai spesifikasi."
}
```

**Responses:**

- `201 Created`: `{ "message": "Kriteria Unjuk Kerja created successfully", "data": { "id": 1, "deskripsi": "..." } }`
- `400 Bad Request`: `{ "message": "deskripsi is required" }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

## 9. Asesi Management

### 9.1 Public Asesi Data (No Auth Required)

These routes are designed to display public information about verified/competent asesies.

#### 9.1.1 Get Provinces with Asesi Count

`GET /asesi/public/provinces`

**Description:** Retrieves a list of provinces with the count of asesies associated with each.
**Responses:**

- `200 OK`:
  ```json
  {
    "data": [
      { "id": 1, "wilayah": "JAWA BARAT", "jumlah": 10 },
      { "id": 2, "wilayah": "DKI JAKARTA", "jumlah": 5 }
    ]
  }
  ```
- `500 Internal Server Error`

#### 9.1.2 Get Cities by Province ID

`GET /asesi/public/provinces/:provinsiId/cities`

**Description:** Retrieves a list of cities/regencies within a specific province, with asesi counts.
**Path Parameters:**

- `provinsiId`: The ID of the province (from `GET /asesi/public/provinces`).
  **Responses:**
- `200 OK`:
  ```json
  {
    "data": [
      { "id": 1, "provinsiId": 1, "wilayah": "KOTA BANDUNG", "jumlah": 7 },
      { "id": 2, "provinsiId": 1, "wilayah": "KOTA BEKASI", "jumlah": 3 }
    ]
  }
  ```
- `500 Internal Server Error` (will return empty array if `provinsiId` is invalid)

#### 9.1.3 Get Asesi by City ID

`GET /asesi/public/cities/:kotaId/asesi`

**Description:** Retrieves a list of asesies for a specific city.
**Path Parameters:**

- `kotaId`: The ID of the city (from `GET /asesi/public/provinces/:provinsiId/cities`).
  **Responses:**
- `200 OK`:
  ```json
  {
    "data": [
      { "id": 101, "nama": "John Doe", "noHp": "08111111111" },
      { "id": 102, "nama": "Jane Smith", "noHp": "08222222222" }
    ]
  }
  ```
- `500 Internal Server Error` (will return empty array if `kotaId` is invalid)

### 9.2 Admin Asesi Management

**All routes below require an `Authorization` header:** `Bearer <admin_jwt_token>`

#### 9.2.1 Get All Asesi Profiles

`GET /asesi`

**Description:** Retrieves a list of all Asesi profiles, with optional filters.
**Query Parameters (Optional):**

- `status`: Filter by status (`'belum terverifikasi'`, `'terverifikasi'`, `'kompeten'`, `'belum kompeten'`).
- `isBlocked`: Filter by blocked status (`true` or `false`).
- `search`: Filter by full name, registration number, username, email, or scheme name.
  **Responses:**
- `200 OK`:
  ```json
  {
    "data": [
      {
        "id": 1,
        "userId": 10,
        "fullName": "Budi Santoso",
        "phoneNumber": "08123456789",
        "address": "Jl. Mawar No. 10, Kota Bandung, Provinsi Jawa Barat",
        "ktpNumber": "1234567890123456",
        "registrationNumber": "AS-001/2024",
        "education": "S1 Teknik Informatika",
        "status": "terverifikasi",
        "isBlocked": false,
        "schemeId": 3,
        "assessmentDate": "2024-07-01",
        "plottingAsesor": "Asesor A",
        "documentsStatus": "Lengkap",
        "certificateStatus": "Belum Dicetak",
        "photoUrl": "http://example.com/photo.jpg",
        "createdAt": "2024-05-01T07:00:00.000Z",
        "updatedAt": "2024-05-01T07:00:00.000Z",
        "schemeName": "JUNIOR WEB DEVELOPER",
        "username": "budi.s",
        "email": "budi.s@example.com"
      }
    ]
  }
  ```
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

#### 9.2.2 Get Asesi Profile by ID

`GET /asesi/:id`

**Description:** Retrieves a single Asesi profile by its `id`.
**Path Parameters:**

- `id`: The ID of the Asesi profile.
  **Responses:**
- `200 OK`: `{ "data": { ... } }` (same format as single item in `GET /asesi` data)
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Asesi not found" }`
- `500 Internal Server Error`

#### 9.2.3 Create Asesi Profile (Admin Only)

`POST /asesi`

**Description:** Creates a new Asesi user and profile.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON):**

```json
{
  "username": "new_asesi_admin",
  "password": "asesi_pass_admin",
  "email": "new_asesi_admin@example.com",
  "fullName": "Admin Added Asesi",
  "ktpNumber": "9876543210987654",
  "registrationNumber": "AD-001/2024",
  "schemeId": 1,
  "phoneNumber": "081122334455",
  "address": "Jl. Admin No. 1, Jakarta",
  "education": "SMA"
}
```

**Responses:**

- `201 Created`: `{ "message": "Asesi created successfully", "user": { ... }, "asesi": { ... } }`
- `400 Bad Request`: `{ "message": "Required fields are missing" }`
- `401 Unauthorized`, `403 Forbidden`
- `409 Conflict`: `{ "message": "Duplicate entry for ..." }`
- `500 Internal Server Error`

#### 9.2.4 Update Asesi Profile (Admin Only)

`PUT /asesi/:id`

**Description:** Updates an existing Asesi profile.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the Asesi profile to update.
  **Body (JSON):**

```json
{
  "fullName": "Admin Added Asesi Updated",
  "status": "kompeten",
  "assessmentDate": "2024-08-15"
}
```

**Responses:**

- `200 OK`: `{ "message": "Asesi updated successfully", "asesi": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Asesi not found" }`
- `409 Conflict`: `{ "message": "Duplicate entry for ..." }`
- `500 Internal Server Error`

#### 9.2.5 Delete Asesi Profile (Admin Only)

`DELETE /asesi/:id`

**Description:** Deletes an Asesi profile and its associated user account.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the Asesi profile to delete.
  **Responses:**
- `200 OK`: `{ "message": "Asesi and associated user deleted successfully", "deletedId": 1 }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Asesi not found" }`
- `500 Internal Server Error`

#### 9.2.6 Import Asesi Data (Admin Only)

`POST /asesi/import`

**Description:** Imports multiple Asesi profiles from a list (e.g., parsed from Excel). This endpoint expects an array of Asesi objects in the request body.
**Authorization:** `Bearer <admin_jwt_token>`
**Body (JSON - Array of Objects):**

```json
[
  {
    "username": "excel_asesi1",
    "password": "excel_password1",
    "email": "excel1@example.com",
    "fullName": "Excel Asesi Satu",
    "registrationNumber": "EXL-001",
    "schemeCode": "SKM-04-LSP WEB",
    "ktpNumber": "1111111111111111",
    "phoneNumber": "081234567890",
    "address": "Jl. Excel No. 1, Jakarta",
    "education": "SMK",
    "assessmentDate": "2024-09-01",
    "plottingAsesor": "Asesor Excel",
    "documentsStatus": "Lengkap",
    "certificateStatus": "Belum Dicetak",
    "photoUrl": null
  },
  {
    "username": "excel_asesi2",
    "password": "excel_password2",
    "email": "excel2@example.com",
    "fullName": "Excel Asesi Dua",
    "registrationNumber": "EXL-002",
    "schemeCode": "SKM-02-LSP Batik",
    "ktpNumber": "2222222222222222",
    "phoneNumber": "081234567891",
    "address": "Jl. Excel No. 2, Bandung"
    // ... other optional fields
  }
]
```

**Responses:**

- `200 OK`: `{ "message": "X Asesi imported/updated successfully", "data": [ ... ] }`
- `400 Bad Request`: `{ "message": "No data provided for import" }`
- `401 Unauthorized`, `403 Forbidden`
- `500 Internal Server Error`

---

### 9.2.7 Verify Asesi (Admin Only)

`PATCH /asesi/:id/verify`

**Description:** Sets the status of an Asesi to 'terverifikasi'.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the Asesi profile to verify.
  **Responses:**
- `200 OK`: `{ "message": "Asesi verified successfully", "verifiedAsesi": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Asesi not found" }`
- `500 Internal Server Error`

#### 9.2.8 Block Asesi (Admin Only)

`PATCH /asesi/:id/block`

**Description:** Blocks an Asesi, setting `isBlocked` to `true`.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the Asesi profile to block.
  **Responses:**
- `200 OK`: `{ "message": "Asesi blocked successfully", "blockedAsesi": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Asesi not found" }`
- `500 Internal Server Error`

#### 9.2.9 Unblock Asesi (Admin Only)

`PATCH /asesi/:id/unblock`

**Description:** Unblocks an Asesi, setting `isBlocked` to `false`.
**Authorization:** `Bearer <admin_jwt_token>`
**Path Parameters:**

- `id`: The ID of the Asesi profile to unblock.
  **Responses:**
- `200 OK`: `{ "message": "Asesi unblocked successfully", "unblockedAsesi": { ... } }`
- `401 Unauthorized`, `403 Forbidden`
- `404 Not Found`: `{ "message": "Asesi not found" }`
- `500 Internal Server Error`

---

This comprehensive list should allow you to thoroughly test your backend using Postman! Remember to manage your JWT tokens for authenticated routes.
