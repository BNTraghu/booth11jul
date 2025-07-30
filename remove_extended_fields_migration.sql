-- Remove Extended Fields Migration Script
-- Remove extended fields from events table that are no longer used in the UI

-- =====================================================
-- EVENTS TABLE MIGRATION
-- =====================================================

-- Remove extended address fields
ALTER TABLE events DROP COLUMN IF EXISTS address_line1;
ALTER TABLE events DROP COLUMN IF EXISTS address_landmark;
ALTER TABLE events DROP COLUMN IF EXISTS address_standard;

-- Remove facility and space details
ALTER TABLE events DROP COLUMN IF EXISTS area_sq_ft;
ALTER TABLE events DROP COLUMN IF EXISTS kind_of_space;
ALTER TABLE events DROP COLUMN IF EXISTS is_covered;
ALTER TABLE events DROP COLUMN IF EXISTS facility_area_sq_ft;
ALTER TABLE events DROP COLUMN IF EXISTS no_of_stalls;
ALTER TABLE events DROP COLUMN IF EXISTS facility_covered;
ALTER TABLE events DROP COLUMN IF EXISTS no_of_flats;

-- Remove pricing field
ALTER TABLE events DROP COLUMN IF EXISTS pricing_per_day;

-- Remove amenities field
ALTER TABLE events DROP COLUMN IF EXISTS amenities;

-- Remove Google Maps fields
ALTER TABLE events DROP COLUMN IF EXISTS latitude;
ALTER TABLE events DROP COLUMN IF EXISTS longitude;
ALTER TABLE events DROP COLUMN IF EXISTS formatted_address;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify events table structure after removal
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Check if any extended fields still exist
SELECT 
    'events' as table_name,
    'STILL_EXISTS' as status,
    unnest(ARRAY[
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
        'amenities',
        'no_of_flats',
        'latitude',
        'longitude',
        'formatted_address'
    ]) as remaining_field
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name IN ('address_line1', 'address_landmark', 'address_standard', 'area_sq_ft', 'kind_of_space', 'is_covered', 'pricing_per_day', 'facility_area_sq_ft', 'no_of_stalls', 'facility_covered', 'amenities', 'no_of_flats', 'latitude', 'longitude', 'formatted_address')
);

-- =====================================================
-- MIGRATION COMPLETION MESSAGE
-- =====================================================

SELECT 'Extended fields removal migration completed successfully!' as status; 