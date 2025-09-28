## 1. Register Admin/Asesi/Asesor

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

## 2. Login

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

## 3. Get My Profile (Dilindungi JWT)

- URL: http://localhost:3000/users/profile
- Method: GET
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <your_jwt_token_here> (Ganti <your_jwt_token_here> dengan token yang Anda dapatkan dari login)

## 4. Change Password (Dilindungi JWT)

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
