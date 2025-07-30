-- Comprehensive Schema Check for Venues and Events Tables
-- Run this to see all current columns and identify missing ones

-- Check Venues Table Schema
SELECT 'VENUES TABLE' as table_name, '' as info
UNION ALL
SELECT 'Column Name', 'Data Type | Nullable | Default'
UNION ALL
SELECT 
    column_name, 
    data_type || ' | ' || 
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END || ' | ' || 
    COALESCE(column_default, 'No Default')
FROM information_schema.columns 
WHERE table_name = 'venues';

-- Check Events Table Schema
SELECT '' as table_name, '' as info
UNION ALL
SELECT 'EVENTS TABLE' as table_name, '' as info
UNION ALL
SELECT 'Column Name', 'Data Type | Nullable | Default'
UNION ALL
SELECT 
    column_name, 
    data_type || ' | ' || 
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END || ' | ' || 
    COALESCE(column_default, 'No Default')
FROM information_schema.columns 
WHERE table_name = 'events';

-- Check if tables exist
SELECT 'TABLE EXISTENCE CHECK' as check_type, '' as result
UNION ALL
SELECT 
    'Venues table exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'venues'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'Events table exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'events'
    ) THEN 'YES' ELSE 'NO' END;

-- Check for missing columns in Venues (based on AddVenue.tsx FormData interface)
SELECT 'MISSING COLUMNS CHECK - VENUES' as check_type, '' as result
UNION ALL
SELECT 
    'name column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'name'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'location column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'location'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'contact_person column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'contact_person'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'email column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'email'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'phone column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'phone'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'capacity column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'capacity'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'facilities column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'facilities'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'amenities column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'amenities'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'description column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'description'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'status column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'status'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'address_line1 column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'address_line1'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'address_landmark column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'address_landmark'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'address_standard column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'address_standard'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'area_sq_ft column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'area_sq_ft'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'kind_of_space column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'kind_of_space'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'is_covered column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'is_covered'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'pricing_per_day column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'pricing_per_day'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'facility_area_sq_ft column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'facility_area_sq_ft'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'no_of_stalls column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'no_of_stalls'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'facility_covered column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'facility_covered'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'no_of_flats column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'no_of_flats'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'latitude column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'latitude'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'longitude column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'longitude'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'formatted_address column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'formatted_address'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'custom_contacts column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'custom_contacts'
    ) THEN 'YES' ELSE 'NO' END;

-- Check for missing columns in Events (based on CreateEvent.tsx FormData interface)
SELECT '' as check_type, '' as result
UNION ALL
SELECT 'MISSING COLUMNS CHECK - EVENTS' as check_type, '' as result
UNION ALL
SELECT 
    'title column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'title'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'description column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'description'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'event_date column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_date'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'event_end_date column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_end_date'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'event_time column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_time'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'event_end_time column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_end_time'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'venue_id column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'venue_id'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'venue_name column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'venue_name'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'city column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'city'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'max_capacity column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'max_capacity'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'plan_type column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'plan_type'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'status column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'status'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'attendees column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'attendees'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'total_revenue column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'total_revenue'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'created_by column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'created_by'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'vendor_ids column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'vendor_ids'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'event_image_url column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_image_url'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'price_per_hour column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'price_per_hour'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'available_hours column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'available_hours'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'parking_spaces column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'parking_spaces'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'catering_allowed column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'catering_allowed'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'alcohol_allowed column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'alcohol_allowed'
    ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
    'smoking_allowed column exists', 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'smoking_allowed'
    ) THEN 'YES' ELSE 'NO' END; 