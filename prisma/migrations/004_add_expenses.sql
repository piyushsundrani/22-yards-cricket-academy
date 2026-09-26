-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id   TEXT UNIQUE NOT NULL,
  date         DATE NOT NULL,
  category     TEXT NOT NULL,
  amount       NUMERIC(10, 2) NOT NULL,
  description  TEXT NOT NULL,
  paid_by      TEXT,
  payment_mode TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can read/write
CREATE POLICY "Allow authenticated read expenses" ON expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert expenses" ON expenses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update expenses" ON expenses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete expenses" ON expenses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
  );
