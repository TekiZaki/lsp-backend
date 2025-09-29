# 📌 Dokumentasi API LSP Backend

---

## 1. Register Admin/Asesi/Asesor

- URL: `http://localhost:3000/api/auth/register`
- Method: **POST**
- Headers:
  - Content-Type: application/json
- Body (raw, JSON):

```json
{
  "username": "adminuser",
  "password": "password123",
  "email": "admin@example.com",
  "role_name": "Admin"
}
```

---

## 2. Login

- URL: `http://localhost:3000/api/auth/login`
- Method: **POST**
- Headers:

  - Content-Type: application/json

- Body (raw, JSON):

```json
{
  "username": "adminuser",
  "password": "password123"
}
```

- Response (example):

```json
{
  "message": "Login successful",
  "token": "<your_jwt_token_here>",
  "user": {
    "id": 1,
    "username": "adminuser",
    "email": "admin@example.com",
    "role_id": 1
  }
}
```

---

## 3. Get My Profile (Dilindungi JWT)

- URL: `http://localhost:3000/api/users/profile`
- Method: **GET**
- Headers:

  - Content-Type: application/json
  - Authorization: Bearer `<your_jwt_token_here>`

---

## 4. Change Password (Dilindungi JWT)

- URL: `http://localhost:3000/api/users/change-password`
- Method: **POST**
- Headers:

  - Content-Type: application/json
  - Authorization: Bearer `<your_jwt_token_here>`

- Body (raw, JSON):

```json
{
  "currentPassword": "password123",
  "newPassword": "newsecurepassword"
}
```

---

## 5. Get All LSPs (Dilindungi JWT)

- URL: `http://localhost:3000/api/lsps?search=&page=1&limit=10`

- Method: **GET**

- Headers:

  - Content-Type: application/json
  - Authorization: Bearer `<your_jwt_token_here>`

- Query Params:

  - `search` _(opsional)_ → filter berdasarkan nama/direktur
  - `page` _(opsional, default 1)_ → halaman
  - `limit` _(opsional, default 10)_ → jumlah data per halaman

---

## 6. Get LSP by ID (Dilindungi JWT)

- URL: `http://localhost:3000/api/lsps/:id`
- Method: **GET**
- Headers:

  - Content-Type: application/json
  - Authorization: Bearer `<your_jwt_token_here>`

---

## 7. Create LSP (Hanya Admin)

- URL: `http://localhost:3000/api/lsps`
- Method: **POST**
- Headers:

  - Content-Type: application/json
  - Authorization: Bearer `<your_jwt_token_here>`

- Body (raw, JSON):

```json
{
  "kode_lsp": "LSP001",
  "nama_lsp": "LSP Teknologi",
  "jenis_lsp": "P1",
  "direktur_lsp": "Budi Santoso",
  "manajer_lsp": "Ani Suryani",
  "institusi_induk": "Universitas Teknologi",
  "skkni": "SKKNI-2025",
  "telepon": "021123456",
  "faximile": "021654321",
  "whatsapp": "081234567890",
  "alamat_email": "info@lspt.com",
  "website": "https://lspt.com",
  "alamat": "Jl. Merdeka No. 10",
  "desa": "Desa Teknologi",
  "kecamatan": "Kecamatan Inovasi",
  "kota": "Jakarta",
  "provinsi": "DKI Jakarta",
  "kode_pos": "12345",
  "nomor_lisensi": "LIS-2025-001",
  "masa_berlaku": "2027-12-31"
}
```

---

## 8. Update LSP (Hanya Admin)

- URL: `http://localhost:3000/api/lsps/:id`
- Method: **PUT**
- Headers:

  - Content-Type: application/json
  - Authorization: Bearer `<your_jwt_token_here>`

- Body (raw, JSON):

```json
{
  "nama_lsp": "LSP Teknologi Update",
  "direktur_lsp": "Andi Wijaya",
  "website": "https://lspt-update.com"
}
```

---

## 9. Delete LSP (Hanya Admin)

- URL: `http://localhost:3000/api/lsps/:id`
- Method: **DELETE**
- Headers:

  - Content-Type: application/json
  - Authorization: Bearer `<your_jwt_token_here>`
