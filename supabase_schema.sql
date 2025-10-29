-- ===========================================================
-- RESET (HATI-HATI: hapus semua data!)
-- ===========================================================
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ===========================================================
-- 1. Roles
-- ===========================================================
CREATE TABLE public.roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Data untuk Roles
INSERT INTO public.roles (id, name) VALUES
(1, 'Admin'),
(2, 'Asesi'),
(3, 'Asesor')
ON CONFLICT (id) DO NOTHING;

-- Set sequence value for roles
SELECT setval('public.roles_id_seq', (SELECT MAX(id) FROM public.roles));

-- ===========================================================
-- 2. User Profiles (link ke Supabase Auth)
-- ===========================================================
CREATE TABLE public.user_profiles (
  id BIGSERIAL PRIMARY KEY,
  -- auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Foreign key constraint removed for dummy data insertion flexibility.
  -- In a real application, you would add this back and ensure auth.users entries exist.
  auth_id UUID, -- Keep the column, but allow NULL for dummy data or provide a valid UUID
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role_id BIGINT REFERENCES public.roles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 3. Certification Schemes
-- ===========================================================
CREATE TABLE public.certification_schemes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  skkni TEXT,
  keterangan_bukti TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 4. Asesi Profiles
-- ===========================================================
CREATE TABLE public.asesi_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  ktp_number TEXT UNIQUE,
  registration_number TEXT UNIQUE NOT NULL,
  education TEXT,
  status TEXT DEFAULT 'belum terverifikasi',
  is_blocked BOOLEAN DEFAULT FALSE,
  scheme_id BIGINT REFERENCES certification_schemes(id) ON DELETE SET NULL,
  assessment_date DATE,
  plotting_asesor TEXT,
  documents_status TEXT DEFAULT 'Belum Lengkap',
  certificate_status TEXT DEFAULT 'Belum Dicetak',
  payment_status TEXT DEFAULT 'belum divalidasi',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 5. Asesor Profiles
-- ===========================================================
CREATE TABLE public.asesor_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  reg_number TEXT UNIQUE NOT NULL,
  is_certified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 6. Admin Profiles
-- ===========================================================
CREATE TABLE public.admin_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  nomor_induk TEXT,
  nomor_lisensi TEXT,
  masa_berlaku TEXT,
  nomor_ktp TEXT UNIQUE,
  ttl TEXT,
  alamat TEXT,
  nomor_hp TEXT,
  email TEXT,
  pendidikan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 7. LSP Institutions
-- ===========================================================
CREATE TABLE public.lsp_institutions (
  id BIGSERIAL PRIMARY KEY,
  nama_lsp TEXT NOT NULL,
  direktur_lsp TEXT,
  jenis_lsp TEXT,
  alamat TEXT,
  telepon TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 8. Tempat Uji Kompetensi (TUK)
-- ===========================================================
CREATE TABLE public.tempat_uji_kompetensi (
  id BIGSERIAL PRIMARY KEY,
  kode_tuk TEXT UNIQUE NOT NULL,
  nama_tempat TEXT NOT NULL,
  jenis_tuk TEXT,
  penanggung_jawab TEXT,
  lisensi_info TEXT,
  skkni_info TEXT,
  jadwal_info TEXT,
  lsp_induk_id BIGINT REFERENCES lsp_institutions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 9. Unit Kompetensi
-- ===========================================================
CREATE TABLE public.unit_kompetensi (
  id BIGSERIAL PRIMARY KEY,
  scheme_id BIGINT REFERENCES certification_schemes(id) ON DELETE CASCADE,
  kode_unit TEXT UNIQUE NOT NULL,
  nama_unit TEXT NOT NULL,
  jenis_standar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 10. Elemen Kompetensi
-- ===========================================================
CREATE TABLE public.elemen_kompetensi (
  id BIGSERIAL PRIMARY KEY,
  unit_id BIGINT REFERENCES unit_kompetensi(id) ON DELETE CASCADE,
  nama_elemen TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 11. Kriteria Unjuk Kerja (KUK)
-- ===========================================================
CREATE TABLE public.kriteria_unjuk_kerja (
  id BIGSERIAL PRIMARY KEY,
  elemen_id BIGINT REFERENCES elemen_kompetensi(id) ON DELETE CASCADE,
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 12. Events (EUK & JUK)
-- ===========================================================
CREATE TABLE public.events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  registration_deadline DATE,
  location TEXT,
  address TEXT,
  max_participants INT,
  penanggung_jawab TEXT,
  lsp_penyelenggara TEXT,
  description TEXT,
  status TEXT,
  scheme_id BIGINT REFERENCES certification_schemes(id) ON DELETE SET NULL,
  tuk_id BIGINT REFERENCES tempat_uji_kompetensi(id) ON DELETE SET NULL,
  asesor_id BIGINT REFERENCES user_profiles(id) ON DELETE SET NULL,
  nomor_surat_tugas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- 13. Event Participants
-- ===========================================================
CREATE TABLE public.event_participants (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  asesi_id BIGINT REFERENCES asesi_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Terdaftar',
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, asesi_id)
);

-- ===========================================================
-- 14. Supporting Tables
-- ===========================================================
CREATE TABLE public.biaya (
  id BIGSERIAL PRIMARY KEY,
  scheme_id BIGINT REFERENCES certification_schemes(id) ON DELETE CASCADE,
  standar TEXT,
  jenis_biaya TEXT NOT NULL,
  nominal INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rekening (
  id BIGSERIAL PRIMARY KEY,
  bank TEXT NOT NULL,
  nomor TEXT NOT NULL,
  atas_nama TEXT NOT NULL,
  nama_lsp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sms_masuk (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  jam TIME NOT NULL,
  isi_pesan TEXT NOT NULL,
  status TEXT DEFAULT 'Masuk',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sms_keluar (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  jam TIME NOT NULL,
  penerima_nama TEXT,
  penerima_nomor TEXT NOT NULL,
  isi_pesan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.persyaratan_skema (
  id BIGSERIAL PRIMARY KEY,
  scheme_id BIGINT REFERENCES certification_schemes(id) ON DELETE CASCADE,
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.dokumen_asesi (
  id BIGSERIAL PRIMARY KEY,
  asesi_id BIGINT REFERENCES asesi_profiles(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  no_dokumen TEXT,
  tanggal DATE,
  status TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.jadwal_asesmen (
  id BIGSERIAL PRIMARY KEY,
  scheme_id BIGINT REFERENCES certification_schemes(id) ON DELETE SET NULL,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  status TEXT DEFAULT 'tersedia',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.website_content (
  id BIGSERIAL PRIMARY KEY,
  thumbnail_url TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  category TEXT NOT NULL,
  slate_content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);


-- ===========================================================
-- DUMMY DATA
-- ===========================================================

-- Certification Schemes
INSERT INTO public.certification_schemes (id, code, name, description, skkni, keterangan_bukti) VALUES
(1, 'SKM-001', 'Skema Desain Grafis', 'Kompetensi di bidang desain visual digital.', 'SKKNI 2020 DG', 'Portofolio dan Uji Praktik'),
(2, 'SKM-002', 'Skema Web Developer', 'Kompetensi di bidang pengembangan web.', 'SKKNI 2021 WD', 'Proyek dan Wawancara'),
(3, 'SKM-01-LSP Batik', 'PEMBUATAN POLA BATIK', 'Skema sertifikasi untuk pembuatan pola batik tradisional.', 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Praktik'),
(4, 'SKM-02-LSP Batik', 'PEMBUATAN BATIK TULIS', 'Skema sertifikasi untuk proses pembuatan batik tulis.', 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Praktik');

-- Set sequence value for certification_schemes
SELECT setval('public.certification_schemes_id_seq', (SELECT MAX(id) FROM public.certification_schemes));

-- LSP Institutions
INSERT INTO public.lsp_institutions (id, nama_lsp, direktur_lsp, jenis_lsp, alamat, telepon, email, website)
VALUES
(1, 'LSP Teknologi Kreatif Indonesia', 'Dr. Hendra Saputra', 'P1', 'Jl. Merdeka No. 45, Jakarta', '021777888', 'info@lsptekno.id', 'https://lsptekno.id'),
(2, 'LSP Batik Semarang', 'Ibu Retno Wulan', 'P2', 'Jl. Batik No. 1, Semarang', '024555666', 'info@lspbatik.id', 'https://lspbatik.id');

-- Set sequence value for lsp_institutions
SELECT setval('public.lsp_institutions_id_seq', (SELECT MAX(id) FROM public.lsp_institutions));

-- Tempat Uji Kompetensi
INSERT INTO public.tempat_uji_kompetensi (id, kode_tuk, nama_tempat, jenis_tuk, penanggung_jawab, lisensi_info, skkni_info, jadwal_info, lsp_induk_id)
VALUES
(1, 'TUK-001', 'TUK Universitas ABC', 'Sewaktu', 'Dr. Budi Raharjo', 'Lisensi No. 2023-TUK-001', 'SKKNI 2020 DG', 'Setiap Sabtu', 1),
(2, 'TUK-002', 'TUK Politeknik XYZ', 'Temporer', 'Ir. Lestari Dewi', 'Lisensi No. 2023-TUK-002', 'SKKNI 2021 WD', 'Setiap Minggu', 1);

-- Set sequence value for tempat_uji_kompetensi
SELECT setval('public.tempat_uji_kompetensi_id_seq', (SELECT MAX(id) FROM public.tempat_uji_kompetensi));

-- Asumsi UUID dari auth.users. Anda perlu mengganti ini dengan UUID nyata dari user yang terdaftar di Supabase Auth
-- ATAU, biarkan NULL untuk data dummy agar tidak terjadi FK error.
-- Saya akan menggunakan NULL untuk 'auth_id' di data dummy ini.
INSERT INTO public.user_profiles (id, auth_id, username, password, email, role_id) VALUES
(1, NULL, 'asesi1', 'asesi1', 'asesi1@example.com', 2),
(2, NULL, 'asesi2', 'asesi2', 'asesi2@example.com', 2),
(3, NULL, 'asesor1', 'asesor1', 'asesor1@example.com', 3),
(4, NULL, 'asesor2', 'asesor2', 'asesor2@example.com', 3),
(5, NULL, 'asesi3', 'asesi3', 'asesi3@example.com', 2);

-- Set sequence value for user_profiles
SELECT setval('public.user_profiles_id_seq', (SELECT MAX(id) FROM public.user_profiles));

-- Asesi Profiles
INSERT INTO public.asesi_profiles (id, user_id, full_name, phone_number, address, ktp_number, registration_number, education, scheme_id, assessment_date, plotting_asesor, photo_url)
VALUES
(1, 1, 'Budi Santoso', '081234567890', 'Jakarta Selatan', '3276010101010001', 'REG-001', 'S1 Teknik Informatika', 1, '2025-11-01', 'Asesor A', 'https://example.com/photos/budi.jpg'),
(2, 2, 'Siti Aminah', '081234567891', 'Bandung', '3276020202020002', 'REG-002', 'D3 Desain Komunikasi Visual', 2, '2025-11-02', 'Asesor B', 'https://example.com/photos/siti.jpg'),
(3, 5, 'NUR SABARIAH', '081329056799', 'Semarang', '3374010101010003', '20180724930002', 'Sarjana Strata I (S1)', 4, NULL, NULL, NULL);

-- Set sequence value for asesi_profiles
SELECT setval('public.asesi_profiles_id_seq', (SELECT MAX(id) FROM public.asesi_profiles));


-- Asesor Profiles
INSERT INTO public.asesor_profiles (id, user_id, full_name, reg_number, is_certified) VALUES
(1, 3, 'Andi Pratama', 'REG-A001', TRUE),
(2, 4, 'Rahmawati', 'REG-A002', TRUE);

-- Set sequence value for asesor_profiles
SELECT setval('public.asesor_profiles_id_seq', (SELECT MAX(id) FROM public.asesor_profiles));

-- Unit Kompetensi
INSERT INTO public.unit_kompetensi (id, scheme_id, kode_unit, nama_unit, jenis_standar) VALUES
(1, 1, 'DG-001', 'Membuat Desain Poster Digital', '(SKKNI)'),
(2, 1, 'DG-002', 'Mengoperasikan Software Desain', '(SKKNI)'),
(3, 2, 'WD-001', 'Membangun Website Responsif', '(SKKNI)'),
(4, 2, 'WD-002', 'Mengelola Database Aplikasi Web', '(SKKNI)'),
(5, 3, 'C.131340.001.01', 'Membuat Pola Batik', '(SKKNI)'),
(6, 3, 'C.131340.002.01', 'Memindahkan Pola Batik dengan Cara Ngeblat', '(SKKNI)'),
(7, 4, 'C.131340.005.01', 'Melekatkan Malam pada Kain menggunakan Canting (Ngrengreng)', '(SKKNI)');

-- Set sequence value for unit_kompetensi
SELECT setval('public.unit_kompetensi_id_seq', (SELECT MAX(id) FROM public.unit_kompetensi));

-- Elemen Kompetensi
INSERT INTO public.elemen_kompetensi (id, unit_id, nama_elemen) VALUES
(1, 1, 'Menentukan konsep desain'),
(2, 1, 'Menyesuaikan warna dan tipografi'),
(3, 2, 'Menggunakan software grafis'),
(4, 3, 'Membuat struktur HTML dan CSS'),
(5, 4, 'Menghubungkan backend dengan frontend'),
(6, 5, 'Mempersiapkan alat dan bahan'),
(7, 6, 'Membuat pola di atas kain');

-- Set sequence value for elemen_kompetensi
SELECT setval('public.elemen_kompetensi_id_seq', (SELECT MAX(id) FROM public.elemen_kompetensi));

-- Kriteria Unjuk Kerja (KUK)
INSERT INTO public.kriteria_unjuk_kerja (id, elemen_id, deskripsi) VALUES
(1, 1, 'Menentukan ide kreatif sesuai brief klien'),
(2, 2, 'Menggunakan kombinasi warna harmonis'),
(3, 3, 'Menjalankan aplikasi desain dengan efisien'),
(4, 4, 'Membuat halaman web responsif'),
(5, 5, 'Menggunakan API untuk komunikasi data'),
(6, 6, 'Alat dan bahan disiapkan sesuai kebutuhan'),
(7, 7, 'Pola dipindahkan ke kain dengan presisi');

-- Set sequence value for kriteria_unjuk_kerja
SELECT setval('public.kriteria_unjuk_kerja_id_seq', (SELECT MAX(id) FROM public.kriteria_unjuk_kerja));

-- Events
INSERT INTO public.events (id, event_name, start_date, end_date, registration_deadline, location, address, max_participants, penanggung_jawab, lsp_penyelenggara, description, status, scheme_id, tuk_id, asesor_id, nomor_surat_tugas)
VALUES
(1, 'EUK Desain Grafis 2025', '2025-11-01', '2025-11-03', '2025-10-25', 'Jakarta', 'Jl. Merdeka No. 45', 30, 'Andi Pratama', 'LSP Teknologi Kreatif Indonesia', 'Evaluasi kemampuan desain grafis peserta.', 'Aktif', 1, 1, 3, 'ST-001'),
(2, 'JUK Web Developer 2025', '2025-11-05', '2025-11-06', '2025-10-28', 'Bandung', 'Jl. Soekarno Hatta No. 10', 25, 'Rahmawati', 'LSP Teknologi Kreatif Indonesia', 'Uji kompetensi pengembangan web.', 'Aktif', 2, 2, 4, 'ST-002');

-- Set sequence value for events
SELECT setval('public.events_id_seq', (SELECT MAX(id) FROM public.events));

-- Event Participants (Peserta Uji Kompetensi)
INSERT INTO public.event_participants (id, event_id, asesi_id, status) VALUES
(1, 1, 1, 'Terdaftar'),
(2, 2, 2, 'Terdaftar');

-- Set sequence value for event_participants
SELECT setval('public.event_participants_id_seq', (SELECT MAX(id) FROM public.event_participants));

-- Biaya (NEW DUMMY DATA)
INSERT INTO public.biaya (id, scheme_id, standar, jenis_biaya, nominal) VALUES
(1, 3, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Fix Cost', 350000),
(2, 3, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Variable Cost', 400000),
(3, 4, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Fix Cost', 200000),
(4, 4, 'INDUSTRI PENYELESAIAN AKHIR TEKSTIL KELOMPOK INDUSTRI BATIK', 'Variable Cost', 300000);

-- Set sequence value for biaya
SELECT setval('public.biaya_id_seq', (SELECT MAX(id) FROM public.biaya));

-- Rekening (NEW DUMMY DATA)
INSERT INTO public.rekening (id, bank, nomor, atas_nama, nama_lsp) VALUES
(1, 'BNI', '111111111111', 'LSP Batik Semarang', 'LSP BATIK'),
(2, 'BTN', '2222222222222222', 'LSP Batik Semarang', 'LSP BATIK'),
(3, 'Tunai', 'Pembayaran Tunai', 'Administrasi Keuangan LSP Batik Semarang', 'LSP BATIK');

-- Set sequence value for rekening
SELECT setval('public.rekening_id_seq', (SELECT MAX(id) FROM public.rekening));

-- SMS Masuk (NEW DUMMY DATA)
INSERT INTO public.sms_masuk (id, tanggal, jam, isi_pesan, status) VALUES
(1, '2024-10-10', '09:15:00', 'Yth. LSP, Kami telah menerima permohonan lisensi TUK baru dari TUK Mandiri Jaya. Mohon ditindaklanjuti. - BNSP', 'Masuk'),
(2, '2024-10-09', '14:30:10', 'Selamat! Sertifikat Asesor a.n. Andi Pratama telah selesai dicetak. Mohon diambil di kantor LSP. - Admin LSP', 'Masuk'),
(3, '2024-10-08', '11:05:45', 'Reminder: Batas waktu verifikasi dokumen asesi untuk batch November adalah 2024-10-15. Harap segera periksa dashboard. - Sistem Otomatis LSP', 'Masuk'),
(4, '2024-10-07', '16:55:20', 'Laporan keuangan Q3 2024 LSP sudah siap. Silakan cek email Anda untuk detailnya. - Divisi Keuangan', 'Masuk'),
(5, '2024-10-06', '08:00:30', 'Info Penting: Ada perubahan jadwal untuk pelaksanaan UK Skema Web Developer. Cek notifikasi di portal. - Admin UK', 'Masuk');

-- Set sequence value for sms_masuk
SELECT setval('public.sms_masuk_id_seq', (SELECT MAX(id) FROM public.sms_masuk));

-- SMS Keluar (NEW DUMMY DATA)
INSERT INTO public.sms_keluar (id, tanggal, jam, penerima_nama, penerima_nomor, isi_pesan, status) VALUES
(1, '2018-08-12', '08:30:04', 'Yth. Atika', '085640912631', 'Anda dijadwal untuk Tugas Asesor pada 2018-08-18, info lengkap lihat di http://batik.slisp.online', 'Terkirim'),
(2, '2018-08-10', '07:23:24', 'Yusuf Rizal Hadi Purnomo', '085731637739', 'Pendaftaran Anda Berhasil, No. Pendaftaran Anda adalah 20180808980002, Password : ca3e0c Silahkan masuk/Login ke http://batik.slisp.online/asesi', 'Terkirim'),
(3, '2018-07-28', '20:48:54', 'Yunita Ekawati', '081329056791', 'Yth. YUNITA EKAWATI Pendaftaran Asesmen SKEMA SKM-02-LSP Batik-PEMBUATAN BATIK TULIS berhasil, lakukan pembayaran biaya asesmen Rp. 500.000', 'Gagal'),
(4, '2018-07-28', '20:48:18', 'Yth. Widhiarso', '081329056791', 'Anda dijadwal untuk Tugas Asesor pada 2018-08-08, info lengkap lihat di http://batik.slisp.online', 'Terkirim'),
(5, '2024-10-08', '09:15:00', 'Antrian Pengiriman', '081111111111', 'Ini adalah contoh SMS yang sedang dalam antrian untuk dikirim.', 'Menunggu');

-- Set sequence value for sms_keluar
SELECT setval('public.sms_keluar_id_seq', (SELECT MAX(id) FROM public.sms_keluar));

-- Persyaratan Skema (NEW DUMMY DATA)
INSERT INTO public.persyaratan_skema (id, scheme_id, deskripsi) VALUES
(1, 4, 'Persyaratan Pendidikan: minimal Sekolah Dasar atau sederajat, atau'),
(2, 4, 'Persyaratan Pelatihan: telah mengikuti pelatihan menyanting dan mopok, atau'),
(3, 4, 'Persyaratan Pengalaman Kerja: memiliki pengalaman kerja minimal 1 tahun di bidang batik tulis.');

-- Set sequence value for persyaratan_skema
SELECT setval('public.persyaratan_skema_id_seq', (SELECT MAX(id) FROM public.persyaratan_skema));

-- Dokumen Asesi (NEW DUMMY DATA) -- Linking to Asesi ID 3 (NUR SABARIAH)
INSERT INTO public.dokumen_asesi (id, asesi_id, nama, no_dokumen, tanggal, file_url) VALUES
(1, 3, 'Persyaratan Rekomendasi...', '703/tab/RK/2018', '2018-07-25', 'https://placehold.co/800x1100'),
(2, 3, 'Persyaratan Pengalaman Kerja...', NULL, NULL, NULL),
(3, 3, 'Persyaratan Pendidikan...', '001/s.pem/I-15/SPIK/2016', '2016-02-09', 'https://placehold.co/800x1100');

-- Set sequence value for dokumen_asesi
SELECT setval('public.dokumen_asesi_id_seq', (SELECT MAX(id) FROM public.dokumen_asesi));

-- Jadwal Asesmen (NEW DUMMY DATA) -- Linking to Scheme ID 4 (Batik Tulis)
INSERT INTO public.jadwal_asesmen (id, scheme_id, nama, deskripsi, status) VALUES
(1, 4, 'Jadwal Pagi - 10 Oktober 2025', 'Uji kompetensi akan dilaksanakan di TUK Pindad pukul 08:00 WIB.', 'tersedia'),
(2, 4, 'Jadwal Siang - 10 Oktober 2025', 'Uji kompetensi akan dilaksanakan di TUK Pindad pukul 13:00 WIB.', 'tersedia');

-- Set sequence value for jadwal_asesmen
SELECT setval('public.jadwal_asesmen_id_seq', (SELECT MAX(id) FROM public.jadwal_asesmen));

-- Default Konten Website (Example from silsp.md)
INSERT INTO public.website_content (id, thumbnail_url, title, subtitle, publish_date, description, category, slate_content) VALUES
(1, 'https://placehold.co/100x100/3b82f6/ffffff?text=Batik', 'Nyolet', 'Nyolet', '2018-05-06 16:05:00', 'Teknik pewarnaan batik dengan kuas', 'portfolio', '[{"type":"paragraph","children":[{"text":"asdasdasdasd","bold":true}]},{"type":"paragraph","children":[{"text":"asdasdasdasd","italic":true}]},{"type":"paragraph","children":[{"text":"asdasd","underline":true}]},{"type":"heading-one","children":[{"text":"asda"}]},{"type":"heading-two","children":[{"text":"sda"}]},{"type":"paragraph","children":[{"text":"sda"}]},{"type":"block-quote","children":[{"text":"sdasdasd"}]},{"type":"numbered-list","children":[{"type":"list-item","children":[{"text":"asdasd"}]},{"type":"list-item","children":[{"text":"asdasd"}]},{"type":"list-item","children":[{"text":"asd"}]}]}]'),
(2, 'https://placehold.co/100x100/10b981/ffffff?text=LSP', 'Tentang Kami', 'Profil', '2020-01-15 10:30:00', 'Sejarah singkat dan visi misi Lembaga Sertifikasi Profesi.', 'halaman', '[{"type":"paragraph","children":[{"text":"asdasdasdasd","bold":true}]},{"type":"paragraph","children":[{"text":"asdasdasdasd","italic":true}]},{"type":"paragraph","children":[{"text":"asdasd","underline":true}]},{"type":"heading-one","children":[{"text":"asda"}]},{"type":"heading-two","children":[{"text":"sda"}]},{"type":"paragraph","children":[{"text":"sda"}]},{"type":"block-quote","children":[{"text":"sdasdasd"}]},{"type":"numbered-list","children":[{"type":"list-item","children":[{"text":"asdasd"}]},{"type":"list-item","children":[{"text":"asdasd"}]},{"type":"list-item","children":[{"text":"asd"}]}]}]'),
(3, 'https://placehold.co/100x100/ef4444/ffffff?text=Info', 'Jadwal Uji Kompetensi Terbaru', 'Berita', '2025-10-01 08:00:00', 'Pendaftaran untuk uji kompetensi gelombang berikutnya telah dibuka.', 'berita', '[{"type":"paragraph","children":[{"text":"asdasdasdasd","bold":true}]},{"type":"paragraph","children":[{"text":"asdasdasdasd","italic":true}]},{"type":"paragraph","children":[{"text":"asdasd","underline":true}]},{"type":"heading-one","children":[{"text":"asda"}]},{"type":"heading-two","children":[{"text":"sda"}]},{"type":"paragraph","children":[{"text":"sda"}]},{"type":"block-quote","children":[{"text":"sdasdasd"}]},{"type":"numbered-list","children":[{"type":"list-item","children":[{"text":"asdasd"}]},{"type":"list-item","children":[{"text":"asdasd"}]},{"type":"list-item","children":[{"text":"asd"}]}]}]');

-- Set sequence value for website_content
SELECT setval('public.website_content_id_seq', (SELECT MAX(id) FROM public.website_content));

-- Dummy Notifications
INSERT INTO public.notifications (id, user_id, type, title, message, created_at, is_read) VALUES
(1, 1, 'new_user', 'Pendaftar Baru', 'Asesi "Budi Santoso" telah mendaftar pada skema "PEMBUATAN BATIK TULIS".', CURRENT_TIMESTAMP - INTERVAL '2 minutes', FALSE),
(2, 2, 'document_upload', 'Dokumen Diunggah', 'Asesi "Ani Wardani" telah mengunggah dokumen persyaratan baru.', CURRENT_TIMESTAMP - INTERVAL '1 hour', FALSE),
(3, 1, 'payment_success', 'Pembayaran Divalidasi', 'Pembayaran untuk asesi "Budi Santoso" telah berhasil divalidasi.', CURRENT_TIMESTAMP - INTERVAL '3 hours', FALSE),
(4, NULL, 'error', 'Impor Gagal', 'Proses impor data asesi dari file "data_asesi.xlsx" gagal. Silakan coba lagi.', CURRENT_TIMESTAMP - INTERVAL '1 day', TRUE),
(5, NULL, 'new_user', 'Pendaftar Baru', 'Asesi "Citra Lestari" telah mendaftar pada skema "JUNIOR WEB DEVELOPER".', CURRENT_TIMESTAMP - INTERVAL '1 day', TRUE),
(6, 2, 'document_upload', 'Dokumen Disetujui', 'Semua dokumen untuk "Ani Wardani" telah disetujui.', CURRENT_TIMESTAMP - INTERVAL '2 days', TRUE);

-- Set sequence value for notifications
SELECT setval('public.notifications_id_seq', (SELECT MAX(id) FROM public.notifications));

-- ===========================================================
-- RLS (Row Level Security)
-- ===========================================================
-- IMPORTANT: Re-add the foreign key constraint *after* seeding if you want it to be enforced.
-- And make sure to populate `auth_id` with valid UUIDs from `auth.users` for real users.
-- For now, commenting out the REFERENCES auth.users(id) allows dummy data insertion without error.
-- To re-enable the foreign key constraint after seeding (if you've populated auth_id with valid UUIDs):
-- ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asesi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asesor_profiles ENABLE ROW LEVEL SECURITY;

-- Note: These RLS policies will only work correctly if auth_id in user_profiles
-- matches auth.uid() of the currently logged-in user. If auth_id is NULL for dummy data,
-- these policies will prevent access to those dummy user_profiles by auth.uid().
CREATE POLICY "Allow users to read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Allow users to update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = auth_id);
