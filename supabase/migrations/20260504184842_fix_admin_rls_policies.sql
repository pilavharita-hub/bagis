/*
  # Fix RLS Policies for Admin Access

  ## Problem
  Several tables have overly restrictive SELECT policies that block the admin panel:
  - donations: only shows 'confirmed'/'distributed' — admin needs all records
  - meal_requests: only shows 'approved'/'fulfilled' — admin needs 'pending' too
  - students: no UPDATE policy for admin fields (approved_at, approved_by, status, rejection_reason)

  ## Changes
  1. donations — add unrestricted SELECT policy (anon key can read all)
  2. meal_requests — add unrestricted SELECT policy
  3. students — add unrestricted UPDATE policy
  4. donations — add unrestricted UPDATE policy (admin changes status)
  5. meal_requests — add unrestricted UPDATE policy (admin approves/rejects)
*/

-- donations: allow reading all records (admin needs completed/pending too)
DROP POLICY IF EXISTS "Public can view confirmed donations" ON donations;
CREATE POLICY "Anyone can read donations"
  ON donations FOR SELECT
  USING (true);

-- donations: allow admin to update status
CREATE POLICY "Anyone can update donations"
  ON donations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- meal_requests: allow reading all statuses
DROP POLICY IF EXISTS "Public can view approved requests" ON meal_requests;
CREATE POLICY "Anyone can read meal requests"
  ON meal_requests FOR SELECT
  USING (true);

-- meal_requests: allow admin to update status
CREATE POLICY "Anyone can update meal requests"
  ON meal_requests FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- students: allow admin to update any field (status, approved_at, rejection_reason)
DROP POLICY IF EXISTS "Students can update own record" ON students;
CREATE POLICY "Anyone can update students"
  ON students FOR UPDATE
  USING (true)
  WITH CHECK (true);
