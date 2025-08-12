-- Add missing columns to venues table
-- This fixes the "Could not find the 'contact_role' column of 'venues' in the schema cache" error
-- and other missing column errors

-- Function to safely add columns
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name text,
    column_name text,
    column_type text,
    column_default text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', $1, $2, $3);
        
        IF $4 IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT %s', $1, $2, $4);
        END IF;
        
        RAISE NOTICE 'Added column % to table %', $2, $1;
    ELSE
        RAISE NOTICE 'Column % already exists in table %', $2, $1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add missing columns
SELECT add_column_if_not_exists('venues', 'contact_role', 'text');
SELECT add_column_if_not_exists('venues', 'address_line1', 'text');
SELECT add_column_if_not_exists('venues', 'address_landmark', 'text');
SELECT add_column_if_not_exists('venues', 'address_standard', 'text');
SELECT add_column_if_not_exists('venues', 'area_sq_ft', 'integer');
SELECT add_column_if_not_exists('venues', 'kind_of_space', 'text');
SELECT add_column_if_not_exists('venues', 'is_covered', 'boolean', 'false');
SELECT add_column_if_not_exists('venues', 'pricing_per_day', 'numeric');
SELECT add_column_if_not_exists('venues', 'facility_area_sq_ft', 'integer');
SELECT add_column_if_not_exists('venues', 'no_of_stalls', 'integer');
SELECT add_column_if_not_exists('venues', 'facility_covered', 'boolean', 'false');
SELECT add_column_if_not_exists('venues', 'no_of_flats', 'integer');
SELECT add_column_if_not_exists('venues', 'latitude', 'numeric');
SELECT add_column_if_not_exists('venues', 'longitude', 'numeric');
SELECT add_column_if_not_exists('venues', 'formatted_address', 'text');

-- Add custom_contacts column if it doesn't exist
SELECT add_column_if_not_exists('venues', 'custom_contacts', 'jsonb', "'[]'::jsonb");

-- Add comments to describe the columns
COMMENT ON COLUMN venues.contact_role IS 'Role/designation of the contact person';
COMMENT ON COLUMN venues.address_line1 IS 'Primary address line';
COMMENT ON COLUMN venues.address_landmark IS 'Landmark or reference point';
COMMENT ON COLUMN venues.address_standard IS 'Standardized address format';
COMMENT ON COLUMN venues.area_sq_ft IS 'Total area in square feet';
COMMENT ON COLUMN venues.kind_of_space IS 'Type of space (indoor/outdoor/mixed)';
COMMENT ON COLUMN venues.is_covered IS 'Whether the venue is covered';
COMMENT ON COLUMN venues.pricing_per_day IS 'Daily pricing rate';
COMMENT ON COLUMN venues.facility_area_sq_ft IS 'Facility area in square feet';
COMMENT ON COLUMN venues.no_of_stalls IS 'Number of available stalls';
COMMENT ON COLUMN venues.facility_covered IS 'Whether the facility is covered';
COMMENT ON COLUMN venues.no_of_flats IS 'Number of available flats';
COMMENT ON COLUMN venues.latitude IS 'Geographic latitude coordinate';
COMMENT ON COLUMN venues.longitude IS 'Geographic longitude coordinate';
COMMENT ON COLUMN venues.formatted_address IS 'Formatted address string';
COMMENT ON COLUMN venues.custom_contacts IS 'Array of custom contact information';

-- Verify all columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venues' 
AND column_name IN (
    'contact_role',
    'address_line1',
    'address_landmark',
    'address_standard',
    'area_sq_ft',
    'kind_of_space',
    'is_covered',
    'pricing_per_day',
    'facility_area_sq_ft',
    'no_of_stalls',
    'facility_covered',
    'no_of_flats',
    'latitude',
    'longitude',
    'formatted_address',
    'custom_contacts'
)
ORDER BY column_name;

-- Clean up
DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text, text); 