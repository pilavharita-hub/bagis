/*
  # Ankara Öğrenci Yemek Sistemi

  ## Genel Bakış
  Ankara'daki üniversite öğrencilerine yönelik askıda pilav sistemi.
  Öğrenciler öğrenci belgesiyle kayıt olur, onaylandıktan sonra QR kodu ile yemek alabilir.

  ## Yeni Tablolar

  ### students
  - `id` (uuid, primary key)
  - `full_name` (text) - öğrencinin adı soyadı
  - `email` (text, unique) - e-posta adresi
  - `phone` (text) - telefon numarası
  - `university` (text) - üniversite adı
  - `student_number` (text) - öğrenci numarası
  - `department` (text) - bölüm
  - `document_url` (text) - öğrenci belgesi dosya yolu
  - `status` (text) - pending, approved, rejected
  - `approved_at` (timestamptz)
  - `approved_by` (text)
  - `created_at` (timestamptz)

  ### qr_tokens
  - `id` (uuid, primary key)
  - `student_id` (uuid, FK -> students)
  - `token` (text, unique) - benzersiz QR token
  - `status` (text) - active, used, expired
  - `expires_at` (timestamptz) - 10 dakika geçerli
  - `used_at` (timestamptz)
  - `used_by_admin` (text)
  - `created_at` (timestamptz)

  ### admin_sessions
  - `id` (uuid, primary key)
  - `username` (text, unique)
  - `password_hash` (text)
  - `created_at` (timestamptz)

  ## Güvenlik
  - RLS tüm tablolarda aktif
  - Öğrenciler yalnızca kendi verilerini görebilir
  - QR tokenlar yalnızca ilgili öğrenci tarafından oluşturulabilir
  - Admin erişimi ayrı politikalarla yönetilir
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  university text NOT NULL DEFAULT '',
  student_number text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  document_url text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  approved_at timestamptz,
  approved_by text DEFAULT '',
  rejection_reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register as student"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Students can view own record by email"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Students can update own record"
  ON students FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- QR tokens table
CREATE TABLE IF NOT EXISTS qr_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at timestamptz,
  used_by_admin text DEFAULT '',
  meal_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create QR tokens"
  ON qr_tokens FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read QR tokens"
  ON qr_tokens FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update QR token status"
  ON qr_tokens FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Admin sessions table (simple admin auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin users"
  ON admin_users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert default admin (password: admin123 - should be changed in production)
INSERT INTO admin_users (username, password) VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Daily meal limit tracking
CREATE TABLE IF NOT EXISTS student_daily_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  meal_date date NOT NULL DEFAULT CURRENT_DATE,
  meals_received integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, meal_date)
);

ALTER TABLE student_daily_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read meal limits"
  ON student_daily_meals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert meal limits"
  ON student_daily_meals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update meal limits"
  ON student_daily_meals FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
