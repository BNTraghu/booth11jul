-- Add new address fields for venues
-- address_line2, city, state, pincode

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE venues ADD COLUMN address_line2 text;
    COMMENT ON COLUMN venues.address_line2 IS 'Secondary address line (e.g., Apartment, Suite)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'city'
  ) THEN
    ALTER TABLE venues ADD COLUMN city text;
    COMMENT ON COLUMN venues.city IS 'City name';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'state'
  ) THEN
    ALTER TABLE venues ADD COLUMN state text;
    COMMENT ON COLUMN venues.state IS 'State/Province name';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'pincode'
  ) THEN
    ALTER TABLE venues ADD COLUMN pincode text;
    COMMENT ON COLUMN venues.pincode IS 'Postal code / PIN (as text to preserve leading zeros)';
  END IF;
END $$;

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'venues' AND column_name IN ('address_line2','city','state','pincode')
ORDER BY column_name; 