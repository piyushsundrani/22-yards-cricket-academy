-- Add payment_month column to billing: the month for which the payment is made
ALTER TABLE billing
  ADD COLUMN IF NOT EXISTS payment_month DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE);

ALTER TABLE billing
  ALTER COLUMN payment_month DROP DEFAULT;
