-- Add rating + stock_qty columns to products (idempotent)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 0.0;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS stock_qty INT DEFAULT 0;

-- Add constraints safely (Postgres doesn't support "IF NOT EXISTS" for constraints)
DO $$
BEGIN
ALTER TABLE products
    ADD CONSTRAINT chk_products_rating CHECK (rating >= 0 AND rating <= 5);
EXCEPTION
  WHEN duplicate_object THEN
    -- constraint already exists, ignore
    NULL;
END $$;

DO $$
BEGIN
ALTER TABLE products
    ADD CONSTRAINT chk_products_stock_qty CHECK (stock_qty >= 0);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;