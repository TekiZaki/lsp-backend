-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Asesi Profiles
CREATE TABLE asesi_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    ktp_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Asesor Profiles (NEW)
CREATE TABLE asesor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    reg_number VARCHAR(50) UNIQUE NOT NULL, -- Nomor Registrasi Asesor
    is_certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Admin Profiles (NEW)
CREATE TABLE admin_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    position VARCHAR(100), -- Contoh: Manager, IT Support
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 6. LSP Institutions
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

-- 7. Tempat Uji Kompetensi (TUK)
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

-- 8. Certification Schemes
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

-- 9. Events (EUK - Event Uji Kompetensi)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Default Roles
INSERT INTO roles (name) VALUES
('Admin'),
('Asesi'),
('Asesor');