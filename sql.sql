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