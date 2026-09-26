-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id     TEXT UNIQUE NOT NULL,
  full_name    TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  role         TEXT NOT NULL,
  joining_date DATE NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Staff Attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can read/write
CREATE POLICY "Allow authenticated read staff" ON staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert staff" ON staff
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update staff" ON staff
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete staff" ON staff
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
  );

CREATE POLICY "Allow authenticated read staff_attendance" ON staff_attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert staff_attendance" ON staff_attendance
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update staff_attendance" ON staff_attendance
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete staff_attendance" ON staff_attendance
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
  );
