-- 1. Tabel Profil Kelurahan
CREATE TABLE IF NOT EXISTS village_info (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    district_name TEXT NOT NULL,
    regency_name TEXT NOT NULL,
    province_name TEXT NOT NULL,
    village_code TEXT NOT NULL,
    bps_code TEXT,
    postal_code TEXT,
    phone_number TEXT NOT NULL,
    email TEXT,
    website TEXT,
    leader_name TEXT NOT NULL,
    leader_title TEXT DEFAULT 'Lurah',
    sekretaris TEXT,
    kaur_umum_n_tata_usaha TEXT,
    kaur_keuangan TEXT,
    kaur_perencanaan TEXT,
    kasi_pemerintah TEXT,
    kasi_kesejahteraan TEXT,
    kasi_pelayanan TEXT,
    kadus1 TEXT,
    kadus2 TEXT,
    kadus3 TEXT,
    logo_url TEXT,
    signature_url TEXT,
    perangkat JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Warga (Residents)
CREATE TABLE IF NOT EXISTS residents (
    id SERIAL PRIMARY KEY,
    kk TEXT NOT NULL,
    nik TEXT UNIQUE NOT NULL,
    ktp_el BOOLEAN DEFAULT TRUE,
    name TEXT NOT NULL,
    birth_place TEXT,
    birth_date TEXT NOT NULL,
    age INT,
    gender TEXT CHECK (gender IN ('Laki-laki', 'Perempuan')),
    address TEXT NOT NULL,
    rt TEXT NOT NULL,
    rw TEXT NOT NULL,
    shdk TEXT CHECK (shdk IN ('Kepala Keluarga', 'Anak', 'Istri', 'Lainnya')),
    photo_url TEXT,
    marital_status TEXT CHECK (marital_status IN ('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati')),
    marriage_certificate BOOLEAN DEFAULT FALSE,
    marriage_certificate_number TEXT,
    divorce_certificate BOOLEAN DEFAULT FALSE,
    divorce_certificate_number TEXT,
    birth_certificate BOOLEAN DEFAULT FALSE,
    birth_certificate_number TEXT,
    education TEXT,
    religion TEXT,
    blood_type TEXT,
    occupation TEXT NOT NULL,
    physical_disability TEXT DEFAULT 'Tidak ada',
    father_name TEXT,
    mother_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Custom Fields
CREATE TABLE IF NOT EXISTS custom_fields (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK (type IN ('text', 'number', 'date', 'select')),
    options JSONB,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Nilai Custom Fields Warga
CREATE TABLE IF NOT EXISTS resident_custom_fields (
    id SERIAL PRIMARY KEY,
    resident_id INT REFERENCES residents(id) ON DELETE CASCADE,
    custom_field_id INT REFERENCES custom_fields(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (resident_id, custom_field_id)
);

-- 5. Tabel Template Surat
CREATE TABLE IF NOT EXISTS letter_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    template TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    fields JSONB,
    signers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Surat yang Dibuat
CREATE TABLE IF NOT EXISTS letters (
    id SERIAL PRIMARY KEY,
    letter_number TEXT NOT NULL UNIQUE,
    letter_type TEXT NOT NULL,
    resident_id INT REFERENCES residents(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    content TEXT,
    purpose TEXT,
    issued_date DATE NOT NULL,
    status TEXT CHECK (status IN ('draft', 'completed', 'signed')),
    signed_by TEXT,
    signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Riwayat Surat (Letter History)
CREATE TABLE IF NOT EXISTS letter_history (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    letter TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Perangkat / Officials
CREATE TABLE IF NOT EXISTS officials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
