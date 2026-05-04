/*
  # Askıda Pilav - Database Schema

  ## Overview
  Social solidarity project where donors can "hang" meals for those in need.

  ## New Tables

  ### donations
  - `id` (uuid, primary key)
  - `donor_name` (text) - donor's display name
  - `donor_email` (text) - contact email
  - `message` (text, optional) - personal message
  - `meal_count` (integer) - number of meals donated
  - `amount` (numeric) - monetary amount in TRY
  - `status` (text) - pending, confirmed, distributed
  - `created_at` (timestamp)

  ### meal_requests
  - `id` (uuid, primary key)
  - `requester_name` (text) - first name only for privacy
  - `city` (text) - city of requester
  - `meal_count` (integer) - number of meals requested
  - `status` (text) - pending, approved, fulfilled
  - `created_at` (timestamp)

  ### stats_counter (single row table for live stats)
  - `id` (integer, primary key)
  - `total_meals_donated` (integer)
  - `total_meals_distributed` (integer)
  - `total_donors` (integer)
  - `total_cities` (integer)
  - `updated_at` (timestamp)

  ## Security
  - RLS enabled on all tables
  - Public can insert donations and meal requests
  - Public can read confirmed/distributed donations and stats
  - Admin access via service role
*/

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL DEFAULT '',
  donor_email text NOT NULL DEFAULT '',
  message text DEFAULT '',
  meal_count integer NOT NULL DEFAULT 1,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a donation"
  ON donations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view confirmed donations"
  ON donations FOR SELECT
  TO anon, authenticated
  USING (status IN ('confirmed', 'distributed'));

-- Meal requests table
CREATE TABLE IF NOT EXISTS meal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  meal_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a meal request"
  ON meal_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view approved requests"
  ON meal_requests FOR SELECT
  TO anon, authenticated
  USING (status IN ('approved', 'fulfilled'));

-- Stats counter table
CREATE TABLE IF NOT EXISTS stats_counter (
  id integer PRIMARY KEY DEFAULT 1,
  total_meals_donated integer NOT NULL DEFAULT 0,
  total_meals_distributed integer NOT NULL DEFAULT 0,
  total_donors integer NOT NULL DEFAULT 0,
  total_cities integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stats_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read stats"
  ON stats_counter FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert initial stats row
INSERT INTO stats_counter (id, total_meals_donated, total_meals_distributed, total_donors, total_cities)
VALUES (1, 12847, 11293, 3421, 47)
ON CONFLICT (id) DO NOTHING;
