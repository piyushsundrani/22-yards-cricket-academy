-- Add valid_till column: the date through which the payment covers the student.
-- due_date is now derived from valid_till (next payment is due once the current one expires).
ALTER TABLE billing
  ADD COLUMN IF NOT EXISTS valid_till DATE;

UPDATE billing SET valid_till = due_date WHERE valid_till IS NULL;

ALTER TABLE billing
  ALTER COLUMN valid_till SET NOT NULL;

-- Paid records past their valid_till date should read as "Expired" rather than "Paid".
ALTER TYPE "BillingStatus" ADD VALUE IF NOT EXISTS 'Expired';
