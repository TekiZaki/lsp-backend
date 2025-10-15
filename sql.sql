-- ===========================================================
-- RESET SCHEMA
-- ===========================================================
DROP SCHEMA public CASCADE;
CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO pg_database_owner;

-- ===========================================================
-- 1. Roles
-- ===========================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 2. Users
-- ===========================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 3. Certification Schemes
-- ===========================================================
CREATE TABLE certification_schemes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    skkni TEXT,
    keterangan_bukti TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 4. Asesi Profiles
-- ===========================================================
CREATE TABLE asesi_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    ktp_number VARCHAR(50) UNIQUE,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    education VARCHAR(100),
    status VARCHAR(50) DEFAULT 'belum terverifikasi',
    is_blocked BOOLEAN DEFAULT FALSE,
    scheme_id INT REFERENCES certification_schemes(id) ON DELETE SET NULL,
    assessment_date DATE,
    plotting_asesor TEXT,
    documents_status TEXT DEFAULT 'Belum Lengkap',
    certificate_status VARCHAR(50) DEFAULT 'Belum Dicetak',
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 5. Asesor Profiles
-- ===========================================================
CREATE TABLE asesor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    reg_number VARCHAR(50) UNIQUE NOT NULL,
    is_certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 6. Admin Profiles
-- ===========================================================
CREATE TABLE admin_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 7. LSP Institutions
-- ===========================================================
CREATE TABLE lsp_institutions (
    id SERIAL PRIMARY KEY,
    nama_lsp VARCHAR(150) NOT NULL,
    direktur_lsp VARCHAR(100),
    jenis_lsp VARCHAR(50),
    alamat TEXT,
    telepon VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 8. Tempat Uji Kompetensi (TUK)
-- ===========================================================
CREATE TABLE tempat_uji_kompetensi (
    id SERIAL PRIMARY KEY,
    kode_tuk VARCHAR(50) UNIQUE NOT NULL,
    nama_tempat VARCHAR(150) NOT NULL,
    jenis_tuk VARCHAR(50),
    penanggung_jawab VARCHAR(100),
    lisensi_info TEXT,
    skkni_info TEXT,
    jadwal_info TEXT,
    lsp_induk_id INT REFERENCES lsp_institutions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 9. Unit Kompetensi
-- ===========================================================
CREATE TABLE unit_kompetensi (
    id SERIAL PRIMARY KEY,
    scheme_id INT REFERENCES certification_schemes(id) ON DELETE CASCADE NOT NULL,
    kode_unit VARCHAR(50) UNIQUE NOT NULL,
    nama_unit VARCHAR(255) NOT NULL,
    jenis_standar VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 10. Elemen Kompetensi
-- ===========================================================
CREATE TABLE elemen_kompetensi (
    id SERIAL PRIMARY KEY,
    unit_id INT REFERENCES unit_kompetensi(id) ON DELETE CASCADE NOT NULL,
    nama_elemen TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 11. Kriteria Unjuk Kerja (KUK)
-- ===========================================================
CREATE TABLE kriteria_unjuk_kerja (
    id SERIAL PRIMARY KEY,
    elemen_id INT REFERENCES elemen_kompetensi(id) ON DELETE CASCADE NOT NULL,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 12. Events (EUK & JUK)
-- ===========================================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    registration_deadline DATE,
    location VARCHAR(150),
    address TEXT,
    max_participants INT,
    penanggung_jawab VARCHAR(100),
    lsp_penyelenggara VARCHAR(150),
    description TEXT,
    status VARCHAR(50),
    scheme_id INT REFERENCES certification_schemes(id) ON DELETE SET NULL,
    tuk_id INT REFERENCES tempat_uji_kompetensi(id) ON DELETE SET NULL,
    asesor_id INT REFERENCES users(id) ON DELETE SET NULL,
    nomor_surat_tugas VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- DEFAULT DATA
-- ===========================================================

-- Roles
INSERT INTO roles (name) VALUES 
('Admin'),
('Asesi'),
('Asesor')
ON CONFLICT (name) DO NOTHING;

-- ===========================================================
-- DUMMY DATA
-- ===========================================================

-- Users (Tanpa Admin)
INSERT INTO users (username, password, email, role_id) VALUES
('asei1', 'hashed_pass_1', 'asei1@example.com', 2),
('asei2', 'hashed_pass_2', 'asei2@example.com', 2),
('asesor1', 'hashed_pass_3', 'asesor1@example.com', 3),
('asesor2', 'hashed_pass_4', 'asesor2@example.com', 3);

-- Certification Schemes
INSERT INTO certification_schemes (code, name, description, skkni, keterangan_bukti) VALUES
('SKM-001', 'Skema Desain Grafis', 'Kompetensi di bidang desain visual digital.', 'SKKNI 2020 DG', 'Portofolio dan Uji Praktik'),
('SKM-002', 'Skema Web Developer', 'Kompetensi di bidang pengembangan web.', 'SKKNI 2021 WD', 'Proyek dan Wawancara');

-- Asesi Profiles
INSERT INTO asesi_profiles (user_id, full_name, phone_number, address, ktp_number, registration_number, education, scheme_id, assessment_date, plotting_asesor, photo_url)
VALUES
(1, 'Budi Santoso', '081234567890', 'Jakarta Selatan', '3276010101010001', 'REG-001', 'S1 Teknik Informatika', 1, '2025-11-01', 'Asesor A', 'https://example.com/photos/budi.jpg'),
(2, 'Siti Aminah', '081234567891', 'Bandung', '3276020202020002', 'REG-002', 'D3 Desain Komunikasi Visual', 2, '2025-11-02', 'Asesor B', 'https://example.com/photos/siti.jpg');

-- Asesor Profiles
INSERT INTO asesor_profiles (user_id, full_name, reg_number, is_certified) VALUES
(3, 'Andi Pratama', 'REG-A001', TRUE),
(4, 'Rahmawati', 'REG-A002', TRUE);

-- LSP Institutions
INSERT INTO lsp_institutions (nama_lsp, direktur_lsp, jenis_lsp, alamat, telepon, email, website)
VALUES
('LSP Teknologi Kreatif Indonesia', 'Dr. Hendra Saputra', 'P1', 'Jl. Merdeka No. 45, Jakarta', '021777888', 'info@lsptekno.id', 'https://lsptekno.id');

-- Tempat Uji Kompetensi
INSERT INTO tempat_uji_kompetensi (kode_tuk, nama_tempat, jenis_tuk, penanggung_jawab, lisensi_info, skkni_info, jadwal_info, lsp_induk_id)
VALUES
('TUK-001', 'TUK Universitas ABC', 'Sewaktu', 'Dr. Budi Raharjo', 'Lisensi No. 2023-TUK-001', 'SKKNI 2020 DG', 'Setiap Sabtu', 1),
('TUK-002', 'TUK Politeknik XYZ', 'Temporer', 'Ir. Lestari Dewi', 'Lisensi No. 2023-TUK-002', 'SKKNI 2021 WD', 'Setiap Minggu', 1);

-- Unit Kompetensi
INSERT INTO unit_kompetensi (scheme_id, kode_unit, nama_unit, jenis_standar) VALUES
(1, 'DG-001', 'Membuat Desain Poster Digital', 'Nasional'),
(1, 'DG-002', 'Mengoperasikan Software Desain', 'Nasional'),
(2, 'WD-001', 'Membangun Website Responsif', 'Internasional'),
(2, 'WD-002', 'Mengelola Database Aplikasi Web', 'Nasional');

-- Elemen Kompetensi
INSERT INTO elemen_kompetensi (unit_id, nama_elemen) VALUES
(1, 'Menentukan konsep desain'),
(1, 'Menyesuaikan warna dan tipografi'),
(2, 'Menggunakan software grafis'),
(3, 'Membuat struktur HTML dan CSS'),
(4, 'Menghubungkan backend dengan frontend');

-- Kriteria Unjuk Kerja (KUK)
INSERT INTO kriteria_unjuk_kerja (elemen_id, deskripsi) VALUES
(1, 'Menentukan ide kreatif sesuai brief klien'),
(2, 'Menggunakan kombinasi warna harmonis'),
(3, 'Menjalankan aplikasi desain dengan efisien'),
(4, 'Membuat halaman web responsif'),
(5, 'Menggunakan API untuk komunikasi data');

-- Events
INSERT INTO events (event_name, start_date, end_date, registration_deadline, location, address, max_participants, penanggung_jawab, lsp_penyelenggara, description, status, scheme_id, tuk_id, asesor_id, nomor_surat_tugas)
VALUES
('EUK Desain Grafis 2025', '2025-11-01', '2025-11-03', '2025-10-25', 'Jakarta', 'Jl. Merdeka No. 45', 30, 'Andi Pratama', 'LSP Teknologi Kreatif Indonesia', 'Evaluasi kemampuan desain grafis peserta.', 'Aktif', 1, 1, 3, 'ST-001'),
('JUK Web Developer 2025', '2025-11-05', '2025-11-06', '2025-10-28', 'Bandung', 'Jl. Soekarno Hatta No. 10', 25, 'Rahmawati', 'LSP Teknologi Kreatif Indonesia', 'Uji kompetensi pengembangan web.', 'Aktif', 2, 2, 4, 'ST-002');
