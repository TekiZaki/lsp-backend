### **Perbaikan yang diperlukan**

1. **Struktur Tabel**

   - Saat ini hanya terdapat tabel `asesi_profiles`.
   - Tambahkan dua tabel baru: `asesor_profiles` dan `admin_profiles`.

2. **Aturan Registrasi & Reset Password**

   - **Admin**
     - Registrasi dan reset password membutuhkan `username`, `password`, serta `secret_key` yang disimpan di file `.env`.
   - **Asesi & Asesor**
     - Reset password membutuhkan `username`, `password` lama, dan `password` baru.

3. **Keamanan**
   - Semua password harus di-_hash_ menggunakan **Bcrypt**.
