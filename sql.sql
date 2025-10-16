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
    payment_status VARCHAR(50) DEFAULT 'belum divalidasi',
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
-- 13. Event Participants (Peserta Uji Kompetensi)
-- ===========================================================
CREATE TABLE event_participants (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    asesi_id INT REFERENCES asesi_profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'Terdaftar', -- e.g., 'Terdaftar', 'Hadir', 'Tidak Hadir', 'Lulus', 'Tidak Lulus'
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, asesi_id) -- An asesi can only be registered once per event
);

-- ===========================================================
-- 14. Supporting Data Tables (NEW)
-- ===========================================================

-- Biaya Sertifikasi
CREATE TABLE biaya (
    id SERIAL PRIMARY KEY,
    scheme_id INT REFERENCES certification_schemes(id) ON DELETE CASCADE,
    standar VARCHAR(255),
    jenis_biaya VARCHAR(50) NOT NULL,
    nominal INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rekening Bank
CREATE TABLE rekening (
    id SERIAL PRIMARY KEY,
    bank VARCHAR(50) NOT NULL,
    nomor VARCHAR(50) NOT NULL,
    atas_nama VARCHAR(100) NOT NULL,
    nama_lsp VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS Masuk
CREATE TABLE sms_masuk (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    jam TIME NOT NULL,
    isi_pesan TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Masuk',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS Keluar
CREATE TABLE sms_keluar (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    jam TIME NOT NULL,
    penerima_nama VARCHAR(100),
    penerima_nomor VARCHAR(20) NOT NULL,
    isi_pesan TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- Terkirim, Gagal, Menunggu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Persyaratan Skema
CREATE TABLE persyaratan_skema (
    id SERIAL PRIMARY KEY,
    scheme_id INT REFERENCES certification_schemes(id) ON DELETE CASCADE,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dokumen Asesi
CREATE TABLE dokumen_asesi (
    id SERIAL PRIMARY KEY,
    asesi_id INT REFERENCES asesi_profiles(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    no_dokumen VARCHAR(100),
    tanggal DATE,
    status VARCHAR(50),
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadwal Asesmen
CREATE TABLE jadwal_asesmen (
    id SERIAL PRIMARY KEY,
    scheme_id INT REFERENCES certification_schemes(id) ON DELETE SET NULL,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    status VARCHAR(50) DEFAULT 'tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Users
INSERT INTO users (username, password, email, role_id) VALUES
('asesi1', 'asesi1', 'asesi1@example.com', 2),
('asesi2', 'asesi2', 'asesi2@example.com', 2),
('asesor1', 'asesor1', 'asesor1@example.com', 3),
('asesor2', 'asesor2', 'asesor2@example.com', 3),
('asesi3', 'asesi3', 'asesi3@example.com', 2);

-- Certification Schemes
INSERT INTO certification_schemes (code, name, description, skkni, keterangan_bukti) VALUES
('SKM-001', 'Skema Desain Grafis', 'Kompetensi di bidang desain visual digital.', 'SKKNI 2020 DG', 'Portofolio dan Uji Praktik'),
('SKM-002', 'Skema Web Developer', 'Kompetensi di bidang pengembangan web.', 'SKKNI 2021 WD', 'Proyek dan Wawancara'),
('SKM-01-LSP Batik', 'PEMBUATAN POLA BATIK', 'Skema sertifikasi untuk pembuatan pola batik tradisional.', 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Praktik'),
('SKM-02-LSP Batik', 'PEMBUATAN BATIK TULIS', 'Skema sertifikasi untuk proses pembuatan batik tulis.', 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Praktik');


-- Asesi Profiles
INSERT INTO asesi_profiles (user_id, full_name, phone_number, address, ktp_number, registration_number, education, scheme_id, assessment_date, plotting_asesor, photo_url)
VALUES
(1, 'Budi Santoso', '081234567890', 'Jakarta Selatan', '3276010101010001', 'REG-001', 'S1 Teknik Informatika', 1, '2025-11-01', 'Asesor A', 'https://example.com/photos/budi.jpg'),
(2, 'Siti Aminah', '081234567891', 'Bandung', '3276020202020002', 'REG-002', 'D3 Desain Komunikasi Visual', 2, '2025-11-02', 'Asesor B', 'https://example.com/photos/siti.jpg'),
(5, 'NUR SABARIAH', '081329056799', 'Semarang', '3374010101010003', '20180724930002', 'Sarjana Strata I (S1)', 4, NULL, NULL, NULL);

-- Asesor Profiles
INSERT INTO asesor_profiles (user_id, full_name, reg_number, is_certified) VALUES
(3, 'Andi Pratama', 'REG-A001', TRUE),
(4, 'Rahmawati', 'REG-A002', TRUE);

-- LSP Institutions
INSERT INTO lsp_institutions (nama_lsp, direktur_lsp, jenis_lsp, alamat, telepon, email, website)
VALUES
('LSP Teknologi Kreatif Indonesia', 'Dr. Hendra Saputra', 'P1', 'Jl. Merdeka No. 45, Jakarta', '021777888', 'info@lsptekno.id', 'https://lsptekno.id'),
('LSP Batik Semarang', 'Ibu Retno Wulan', 'P2', 'Jl. Batik No. 1, Semarang', '024555666', 'info@lspbatik.id', 'https://lspbatik.id');

-- Tempat Uji Kompetensi
INSERT INTO tempat_uji_kompetensi (kode_tuk, nama_tempat, jenis_tuk, penanggung_jawab, lisensi_info, skkni_info, jadwal_info, lsp_induk_id)
VALUES
('TUK-001', 'TUK Universitas ABC', 'Sewaktu', 'Dr. Budi Raharjo', 'Lisensi No. 2023-TUK-001', 'SKKNI 2020 DG', 'Setiap Sabtu', 1),
('TUK-002', 'TUK Politeknik XYZ', 'Temporer', 'Ir. Lestari Dewi', 'Lisensi No. 2023-TUK-002', 'SKKNI 2021 WD', 'Setiap Minggu', 1);

-- Unit Kompetensi
INSERT INTO unit_kompetensi (scheme_id, kode_unit, nama_unit, jenis_standar) VALUES
(1, 'DG-001', 'Membuat Desain Poster Digital', '(SKKNI)'),
(1, 'DG-002', 'Mengoperasikan Software Desain', '(SKKNI)'),
(2, 'WD-001', 'Membangun Website Responsif', '(SKKNI)'),
(2, 'WD-002', 'Mengelola Database Aplikasi Web', '(SKKNI)'),
(3, 'C.131340.001.01', 'Membuat Pola Batik', '(SKKNI)'),
(3, 'C.131340.002.01', 'Memindahkan Pola Batik dengan Cara Ngeblat', '(SKKNI)'),
(4, 'C.131340.005.01', 'Melekatkan Malam pada Kain menggunakan Canting (Ngrengreng)', '(SKKNI)');


-- Elemen Kompetensi
INSERT INTO elemen_kompetensi (unit_id, nama_elemen) VALUES
(1, 'Menentukan konsep desain'),
(1, 'Menyesuaikan warna dan tipografi'),
(2, 'Menggunakan software grafis'),
(3, 'Membuat struktur HTML dan CSS'),
(4, 'Menghubungkan backend dengan frontend'),
(5, 'Mempersiapkan alat dan bahan'),
(6, 'Membuat pola di atas kain');

-- Kriteria Unjuk Kerja (KUK)
INSERT INTO kriteria_unjuk_kerja (elemen_id, deskripsi) VALUES
(1, 'Menentukan ide kreatif sesuai brief klien'),
(2, 'Menggunakan kombinasi warna harmonis'),
(3, 'Menjalankan aplikasi desain dengan efisien'),
(4, 'Membuat halaman web responsif'),
(5, 'Menggunakan API untuk komunikasi data'),
(6, 'Alat dan bahan disiapkan sesuai kebutuhan'),
(7, 'Pola dipindahkan ke kain dengan presisi');

-- Events
INSERT INTO events (event_name, start_date, end_date, registration_deadline, location, address, max_participants, penanggung_jawab, lsp_penyelenggara, description, status, scheme_id, tuk_id, asesor_id, nomor_surat_tugas)
VALUES
('EUK Desain Grafis 2025', '2025-11-01', '2025-11-03', '2025-10-25', 'Jakarta', 'Jl. Merdeka No. 45', 30, 'Andi Pratama', 'LSP Teknologi Kreatif Indonesia', 'Evaluasi kemampuan desain grafis peserta.', 'Aktif', 1, 1, 3, 'ST-001'),
('JUK Web Developer 2025', '2025-11-05', '2025-11-06', '2025-10-28', 'Bandung', 'Jl. Soekarno Hatta No. 10', 25, 'Rahmawati', 'LSP Teknologi Kreatif Indonesia', 'Uji kompetensi pengembangan web.', 'Aktif', 2, 2, 4, 'ST-002');

-- Event Participants (Peserta Uji Kompetensi)
INSERT INTO event_participants (event_id, asesi_id, status) VALUES
(1, 1, 'Terdaftar'),
(2, 2, 'Terdaftar');

-- Biaya (NEW DUMMY DATA)
INSERT INTO biaya (scheme_id, standar, jenis_biaya, nominal) VALUES
(3, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Fix Cost', 350000),
(3, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Variable Cost', 400000),
(4, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Fix Cost', 200000),
(4, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Variable Cost', 300000);

-- Rekening (NEW DUMMY DATA)
INSERT INTO rekening (bank, nomor, atas_nama, nama_lsp) VALUES
('BNI', '111111111111', 'LSP Batik Semarang', 'LSP BATIK'),
('BTN', '2222222222222222', 'LSP Batik Semarang', 'LSP BATIK'),
('Tunai', 'Pembayaran Tunai', 'Administrasi Keuangan LSP Batik Semarang', 'LSP BATIK');

-- SMS Masuk (NEW DUMMY DATA)
INSERT INTO sms_masuk (tanggal, jam, isi_pesan, status) VALUES
('2018-08-11', '15:51:20', 'Bonus Ajakan Teman Sudah Kami Proseskan. Segera Cek ID Nya Di Link Terbaru Kami Yang Mudah Menang Nya Boss pelangiqqasia.com / pelangiqq.vegas', 'Masuk'),
('2018-08-08', '10:41:07', 'PelangiQQ Bagi2 BONUS Boss !! Cek User ID Anda Sekarang dan Bagikan Pesan ini ke Teman2. Claim Bonus di PelangiQQ.Vegas', 'Masuk'),
('2018-08-05', '15:37:47', 'KABAR GEMBIRA! isi pulsa BERAPAPUN langsung DAPAT PAKET 1GB 1 hari. Berlaku hanya 2 hari! Info 123.', 'Masuk'),
('2018-08-04', '07:44:28', 'KABAR GEMBIRA! isi pulsa BERAPAPUN langsung DAPAT PAKET 1GB 1 hari. Berlaku hanya 2 hari! Info 123.', 'Masuk'),
('2018-08-03', '21:05:10', 'KABAR GEMBIRA! isi pulsa BERAPAPUN langsung DAPAT PAKET 1GB 1 hari. Berlaku hanya 2 hari! Info 123.', 'Masuk');

-- SMS Keluar (NEW DUMMY DATA)
INSERT INTO sms_keluar (tanggal, jam, penerima_nama, penerima_nomor, isi_pesan, status) VALUES
('2018-08-12', '08:30:04', 'Yth. Atika', '085640912631', 'Anda dijadwal untuk Tugas Asesor pada 2018-08-18, info lengkap lihat di http://batik.slisp.online', 'Terkirim'),
('2018-08-10', '07:23:24', 'Yusuf Rizal Hadi Purnomo', '085731637739', 'Pendaftaran Anda Berhasil, No. Pendaftaran Anda adalah 20180808980002, Password : ca3e0c Silahkan masuk/Login ke http://batik.slisp.online/asesi', 'Terkirim'),
('2018-07-28', '20:48:54', 'Yunita Ekawati', '081329056791', 'Yth. YUNITA EKAWATI Pendaftaran Asesmen SKEMA SKM-02-LSP Batik-PEMBUATAN BATIK TULIS berhasil, lakukan pembayaran biaya asesmen Rp. 500.000', 'Gagal'),
('2018-07-28', '20:48:18', 'Yth. Widhiarso', '081329056791', 'Anda dijadwal untuk Tugas Asesor pada 2018-08-08, info lengkap lihat di http://batik.slisp.online', 'Terkirim'),
('2024-10-08', '09:15:00', 'Antrian Pengiriman', '081111111111', 'Ini adalah contoh SMS yang sedang dalam antrian untuk dikirim.', 'Menunggu');

-- Persyaratan Skema (NEW DUMMY DATA)
INSERT INTO persyaratan_skema (scheme_id, deskripsi) VALUES
(4, 'Persyaratan Pendidikan: minimal Sekolah Dasar atau sederajat, atau'),
(4, 'Persyaratan Pelatihan: telah mengikuti pelatihan menyanting dan mopok, atau'),
(4, 'Persyaratan Pengalaman Kerja: memiliki pengalaman kerja minimal 1 tahun di bidang batik tulis.');

-- Dokumen Asesi (NEW DUMMY DATA) -- Linking to Asesi ID 3 (NUR SABARIAH)
INSERT INTO dokumen_asesi (asesi_id, nama, no_dokumen, tanggal, file_url) VALUES
(3, 'Persyaratan Rekomendasi...', '703/tab/RK/2018', '2018-07-25', 'https://placehold.co/800x1100'),
(3, 'Persyaratan Pengalaman Kerja...', NULL, NULL, NULL),
(3, 'Persyaratan Pendidikan...', '001/s.pem/I-15/SPIK/2016', '2016-02-09', 'https://placehold.co/800x1100');

-- Jadwal Asesmen (NEW DUMMY DATA) -- Linking to Scheme ID 4 (Batik Tulis)
INSERT INTO jadwal_asesmen (scheme_id, nama, deskripsi, status) VALUES
(4, 'Jadwal Pagi - 10 Oktober 2025', 'Uji kompetensi akan dilaksanakan di TUK Pindad pukul 08:00 WIB.', 'tersedia'),
(4, 'Jadwal Siang - 10 Oktober 2025', 'Uji kompetensi akan dilaksanakan di TUK Pindad pukul 13:00 WIB.', 'tersedia');