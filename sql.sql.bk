-- Table: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- e.g., 'Admin', 'Asesi', 'Asesor'
);

-- Insert initial roles
INSERT INTO roles (name) VALUES ('Admin'), ('Asesi'), ('Asesor') ON CONFLICT (name) DO NOTHING;

-- Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: certification_schemes (Skema Sertifikasi)
CREATE TABLE certification_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: competency_units (Unit Kompetensi)
CREATE TABLE competency_units (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id),
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: events (Event Uji Kompetensi)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id),
    event_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    location TEXT,
    description TEXT,
    max_participants INTEGER,
    status VARCHAR(50) DEFAULT 'open', -- e.g., 'open', 'closed', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: asesi_registrations (Pendaftaran Asesi ke Event)
CREATE TABLE asesi_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id), -- User dengan role 'Asesi'
    event_id INTEGER NOT NULL REFERENCES events(id),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending_payment', -- e.g., 'pending_payment', 'waiting_verification', 'registered', 'rejected'
    payment_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id) -- Asesi hanya bisa mendaftar ke satu event satu kali
);

-- Table: assessors (Data Asesor)
CREATE TABLE assessors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id), -- User dengan role 'Asesor'
    nip VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    expertise TEXT, -- Bidang keahlian
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: asesi_profiles (Data Profil Asesi)
CREATE TABLE asesi_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id), -- User dengan role 'Asesi'
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10), -- 'male', 'female'
    phone_number VARCHAR(20),
    address TEXT,
    education_level VARCHAR(100),
    ktp_number VARCHAR(20) UNIQUE,
    ktp_scan_url TEXT, -- URL ke scan KTP
    cv_url TEXT, -- URL ke CV
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: schedules (Jadwal Uji Kompetensi)
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id),
    asesor_id INTEGER REFERENCES assessors(id), -- Nullable jika asesor belum ditunjuk
    asesi_registration_id INTEGER REFERENCES asesi_registrations(id), -- Jadwal spesifik untuk asesi
    test_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    tuk_location TEXT, -- Tempat Uji Kompetensi
    status VARCHAR(50) DEFAULT 'scheduled', -- e.g., 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: assessment_results (Hasil Uji Kompetensi)
CREATE TABLE assessment_results (
    id SERIAL PRIMARY KEY,
    asesi_registration_id INTEGER NOT NULL REFERENCES asesi_registrations(id),
    asesor_id INTEGER NOT NULL REFERENCES assessors(id),
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id),
    assessment_date DATE NOT NULL,
    result VARCHAR(50) NOT NULL, -- e.g., 'Kompeten', 'Belum Kompeten'
    feedback TEXT,
    certificate_url TEXT, -- URL ke sertifikat jika kompeten
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: sms_notifications (Log Notifikasi SMS)
CREATE TABLE sms_notifications (
    id SERIAL PRIMARY KEY,
    recipient_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: frontpage_content (Konten Frontpage Website)
CREATE TABLE frontpage_content (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'hero_banner', 'about_us', 'news', 'contact_info'
    title VARCHAR(255),
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pastikan tabel roles dan users sudah ada dan terisi
-- ... (skrip CREATE TABLE users dan roles dari jawaban sebelumnya) ...

-- Table: certification_schemes (Skema Sertifikasi)
CREATE TABLE IF NOT EXISTS certification_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: competency_units (Unit Kompetensi)
CREATE TABLE IF NOT EXISTS competency_units (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: events (Event Uji Kompetensi)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id) ON DELETE RESTRICT, -- RESTRICT agar tidak menghapus skema yang punya event
    event_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    location TEXT,
    description TEXT,
    max_participants INTEGER,
    status VARCHAR(50) DEFAULT 'open', -- e.g., 'open', 'closed', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: lsp_institutions (Lembaga Sertifikasi Profesi) - Ini adalah tabel baru untuk menggantikan penggunaan dummy data LSP
CREATE TABLE IF NOT EXISTS lsp_institutions (
    id SERIAL PRIMARY KEY,
    kode_lsp VARCHAR(50) UNIQUE NOT NULL,
    nama_lsp VARCHAR(255) NOT NULL,
    jenis_lsp VARCHAR(10) NOT NULL, -- P1, P2, P3
    direktur_lsp VARCHAR(255),
    manajer_lsp VARCHAR(255),
    institusi_induk VARCHAR(255),
    skkni TEXT,
    telepon VARCHAR(50),
    faximile VARCHAR(50),
    whatsapp VARCHAR(50),
    alamat_email VARCHAR(255),
    website VARCHAR(255),
    alamat TEXT,
    desa VARCHAR(100),
    kecamatan VARCHAR(100),
    kota VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    nomor_lisensi VARCHAR(100),
    masa_berlaku DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: asesi_registrations (Pendaftaran Asesi ke Event)
CREATE TABLE IF NOT EXISTS asesi_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User dengan role 'Asesi'
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending_payment', -- e.g., 'pending_payment', 'waiting_verification', 'registered', 'rejected'
    payment_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id) -- Asesi hanya bisa mendaftar ke satu event satu kali
);

-- Table: assessors (Data Asesor)
CREATE TABLE IF NOT EXISTS assessors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, -- User dengan role 'Asesor'
    nip VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    expertise TEXT, -- Bidang keahlian
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: asesi_profiles (Data Profil Asesi)
CREATE TABLE IF NOT EXISTS asesi_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, -- User dengan role 'Asesi'
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10), -- 'male', 'female'
    phone_number VARCHAR(20),
    address TEXT,
    education_level VARCHAR(100),
    ktp_number VARCHAR(20) UNIQUE,
    ktp_scan_url TEXT, -- URL ke scan KTP
    cv_url TEXT, -- URL ke CV
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: schedules (Jadwal Uji Kompetensi)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    asesor_id INTEGER REFERENCES assessors(id) ON DELETE SET NULL, -- Nullable jika asesor belum ditunjuk
    asesi_registration_id INTEGER REFERENCES asesi_registrations(id) ON DELETE CASCADE, -- Jadwal spesifik untuk asesi
    test_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    tuk_location TEXT, -- Tempat Uji Kompetensi
    status VARCHAR(50) DEFAULT 'scheduled', -- e.g., 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: assessment_results (Hasil Uji Kompetensi)
CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    asesi_registration_id INTEGER NOT NULL REFERENCES asesi_registrations(id) ON DELETE CASCADE,
    asesor_id INTEGER NOT NULL REFERENCES assessors(id) ON DELETE CASCADE,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,
    result VARCHAR(50) NOT NULL, -- e.g., 'Kompeten', 'Belum Kompeten'
    feedback TEXT,
    certificate_url TEXT, -- URL ke sertifikat jika kompeten
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: sms_notifications (Log Notifikasi SMS)
CREATE TABLE IF NOT EXISTS sms_notifications (
    id SERIAL PRIMARY KEY,
    recipient_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: frontpage_content (Konten Frontpage Website)
CREATE TABLE IF NOT EXISTS frontpage_content (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'hero_banner', 'about_us', 'news', 'contact_info'
    title VARCHAR(255),
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: biaya (Biaya)
CREATE TABLE IF NOT EXISTS biaya (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER REFERENCES certification_schemes(id) ON DELETE SET NULL, -- Biaya bisa terkait skema atau umum
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: payment_reports (Laporan Pembayaran)
CREATE TABLE IF NOT EXISTS payment_reports (
    id SERIAL PRIMARY KEY,
    asesi_registration_id INTEGER NOT NULL REFERENCES asesi_registrations(id) ON DELETE CASCADE,
    amount_paid DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(100),
    status VARCHAR(50) DEFAULT 'success', -- e.g., 'success', 'failed', 'pending'
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tambahan untuk lsp_institutions (sudah ada, tapi memastikan kolom sesuai)
-- Tabel: lsp_institutions
CREATE TABLE IF NOT EXISTS lsp_institutions (
    id SERIAL PRIMARY KEY,
    kode_lsp VARCHAR(50) UNIQUE NOT NULL,
    nama_lsp VARCHAR(255) NOT NULL,
    jenis_lsp VARCHAR(10) NOT NULL, -- P1, P2, P3
    direktur_lsp VARCHAR(255),
    manajer_lsp VARCHAR(255),
    institusi_induk VARCHAR(255),
    skkni TEXT,
    telepon VARCHAR(50),
    faximile VARCHAR(50),
    whatsapp VARCHAR(50),
    alamat_email VARCHAR(255),
    website VARCHAR(255),
    alamat TEXT,
    desa VARCHAR(100),
    kecamatan VARCHAR(100),
    kota VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    nomor_lisensi VARCHAR(100),
    masa_berlaku DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Baru: tempat_uji_kompetensi (TUK)
CREATE TABLE IF NOT EXISTS tempat_uji_kompetensi (
    id SERIAL PRIMARY KEY,
    kode_tuk VARCHAR(50) UNIQUE NOT NULL,
    nama_tempat VARCHAR(255) NOT NULL,
    jenis_tuk VARCHAR(50) NOT NULL, -- Sewaktu, Permanen, Mandiri
    lsp_induk_id INTEGER REFERENCES lsp_institutions(id) ON DELETE SET NULL, -- LSP yang menaungi
    penanggung_jawab VARCHAR(255),
    lisensi_info TEXT, -- Detail Lisensi TUK
    skkni_info TEXT,
    jadwal_info TEXT, -- Informasi jadwal TUK
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel: certification_schemes (Skema Sertifikasi) - Diperbarui
CREATE TABLE IF NOT EXISTS certification_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    skkni TEXT, -- Tambahan field SKKNI
    keterangan_bukti TEXT, -- Tambahan field untuk form skema
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Baru: scheme_requirements (Persyaratan Skema)
CREATE TABLE IF NOT EXISTS scheme_requirements (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER NOT NULL REFERENCES certification_schemes(id) ON DELETE CASCADE,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel: events (Event Uji Kompetensi) - Diperbarui
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    scheme_id INTEGER REFERENCES certification_schemes(id) ON DELETE SET NULL, -- Scheme yang ditawarkan dalam event
    event_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE,
    location TEXT,
    description TEXT,
    max_participants INTEGER,
    status VARCHAR(50) DEFAULT 'open',
    lsp_penyelenggara VARCHAR(255), -- Tambahan
    penanggung_jawab VARCHAR(255),  -- Tambahan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);