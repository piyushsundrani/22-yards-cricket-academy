-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE "Batch" AS ENUM ('Morning', 'Evening', 'Weekend');
CREATE TYPE "Level" AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE "FeeType" AS ENUM ('Monthly', 'Quarterly', 'Annual');
CREATE TYPE "PaymentMode" AS ENUM ('Cash', 'UPI', 'Bank Transfer');
CREATE TYPE "BillingStatus" AS ENUM ('Paid', 'Pending', 'Overdue');
CREATE TYPE "Role" AS ENUM ('Admin', 'Staff');

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  date_of_birth   DATE NOT NULL,
  gender          "Gender" NOT NULL,
  contact_number  TEXT NOT NULL,
  guardian_name   TEXT NOT NULL,
  address         TEXT,
  batch           "Batch" NOT NULL,
  level           "Level" NOT NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  photo_url       TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Billing table
CREATE TABLE IF NOT EXISTS billing (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  student_id     UUID REFERENCES students(id) ON DELETE CASCADE,
  fee_type       "FeeType" NOT NULL,
  amount         NUMERIC(10,2) NOT NULL,
  payment_date   DATE,
  due_date       DATE NOT NULL,
  payment_mode   "PaymentMode",
  status         "BillingStatus" NOT NULL DEFAULT 'Pending',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  role       "Role" NOT NULL DEFAULT 'Staff',
  full_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can read/write
CREATE POLICY "Allow authenticated read students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert students" ON students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update students" ON students
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete students" ON students
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
  );

CREATE POLICY "Allow authenticated read billing" ON billing
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert billing" ON billing
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update billing" ON billing
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete billing" ON billing
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
  );

CREATE POLICY "Allow admin read users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
  );

CREATE POLICY "Allow admin manage users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
  );
