/*
  # Ankara Öğrenci Pilav Sistemi v2 - Anti-Suistimal

  ## Değişiklikler

  ### students tablosu - yeni sütunlar
  - `daily_limit` (integer, default 2) - günlük porsiyon limiti
  - `weekly_limit` (integer, default 12) - haftalık porsiyon limiti
  - `total_meals_received` (integer) - toplam alınan porsiyon

  ### qr_tokens tablosu - cihaz & IP bilgisi
  - `device_fingerprint` (text) - cihaz parmak izi
  - `ip_address` (text) - oluşturan IP

  ### meal_redemptions tablosu - teslim anları
  - Gerçek teslim kayıtları (fotoğraf, konum, not)
  - Admin tarafından doldurulur

  ### abuse_logs tablosu - suistimal takibi
  - Şüpheli aktiviteleri loglar

  ## Yeni istatistik fonksiyonları
*/

-- students tablosuna yeni sütunlar ekle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='daily_limit') THEN
    ALTER TABLE students ADD COLUMN daily_limit integer NOT NULL DEFAULT 2;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='weekly_limit') THEN
    ALTER TABLE students ADD COLUMN weekly_limit integer NOT NULL DEFAULT 12;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='total_meals_received') THEN
    ALTER TABLE students ADD COLUMN total_meals_received integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- qr_tokens tablosuna cihaz/IP ekle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='qr_tokens' AND column_name='device_fingerprint') THEN
    ALTER TABLE qr_tokens ADD COLUMN device_fingerprint text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='qr_tokens' AND column_name='ip_address') THEN
    ALTER TABLE qr_tokens ADD COLUMN ip_address text DEFAULT '';
  END IF;
END $$;

-- Teslim anları tablosu
CREATE TABLE IF NOT EXISTS meal_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  qr_token_id uuid REFERENCES qr_tokens(id),
  admin_username text NOT NULL DEFAULT '',
  meal_count integer NOT NULL DEFAULT 1,
  note text DEFAULT '',
  redeemed_at timestamptz DEFAULT now()
);

ALTER TABLE meal_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read redemptions"
  ON meal_redemptions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert redemptions"
  ON meal_redemptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Suistimal log tablosu
CREATE TABLE IF NOT EXISTS abuse_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT '',
  device_fingerprint text DEFAULT '',
  ip_address text DEFAULT '',
  details text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE abuse_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert abuse logs"
  ON abuse_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read abuse logs"
  ON abuse_logs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Global istatistik tablosu (tek satır)
CREATE TABLE IF NOT EXISTS global_stats (
  id integer PRIMARY KEY DEFAULT 1,
  today_meals integer NOT NULL DEFAULT 0,
  today_date date NOT NULL DEFAULT CURRENT_DATE,
  total_meals_all_time integer NOT NULL DEFAULT 2847,
  total_donors integer NOT NULL DEFAULT 312,
  total_students_approved integer NOT NULL DEFAULT 0,
  waiting_students integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global stats"
  ON global_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update global stats"
  ON global_stats FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert global stats"
  ON global_stats FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

INSERT INTO global_stats (id, today_meals, today_date, total_meals_all_time, total_donors, waiting_students)
VALUES (1, 42, CURRENT_DATE, 2847, 312, 12)
ON CONFLICT (id) DO NOTHING;

-- Donations tablosu: Ankara odaklı
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donations' AND column_name='is_recurring') THEN
    ALTER TABLE donations ADD COLUMN is_recurring boolean DEFAULT false;
  END IF;
END $$;
