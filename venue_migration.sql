-- Venue Migration Script
-- Add extended venue fields to match CreateEvent structure

-- =====================================================
-- VENUES TABLE MIGRATION
-- =====================================================

-- Add extended address fields
ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_landmark text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_standard text;

-- Add facility and space details
ALTER TABLE venues ADD COLUMN IF NOT EXISTS area_sq_ft integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS kind_of_space text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_covered boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS facility_area_sq_ft integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS no_of_stalls integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS facility_covered boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS no_of_flats integer;

-- Add pricing and availability
ALTER TABLE venues ADD COLUMN IF NOT EXISTS pricing_per_day numeric;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS available_hours text DEFAULT '9:00 AM - 11:00 PM';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS parking_spaces integer DEFAULT 0;

-- Add policies
ALTER TABLE venues ADD COLUMN IF NOT EXISTS catering_allowed boolean DEFAULT true;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS alcohol_allowed boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false;

-- Add Google Maps fields
ALTER TABLE venues ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS formatted_address text;

-- Add description field if not exists
ALTER TABLE venues ADD COLUMN IF NOT EXISTS description text;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify venues table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venues' 
ORDER BY ordinal_position;

-- Check for missing required fields in venues
SELECT 
    'venues' as table_name,
    'MISSING' as status,
    unnest(ARRAY[
        'address_line1',
        'address_standard', 
        'area_sq_ft',
        'kind_of_space',
        'latitude',
        'longitude',
        'formatted_address',
        'description'
    ]) as missing_field
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' 
    AND column_name IN ('address_line1', 'address_standard', 'area_sq_ft', 'kind_of_space', 'latitude', 'longitude', 'formatted_address', 'description')
);

-- =====================================================
-- MIGRATION COMPLETION MESSAGE
-- =====================================================

SELECT 'Venue migration completed successfully!' as status; 