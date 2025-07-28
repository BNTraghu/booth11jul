-- Quick Schema Verification Script
-- Run this to check current table structure

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM information_schema.tables 
WHERE table_name IN ('events', 'exhibitors')
AND table_schema = 'public';

-- Check events table columns
SELECT 
    'events' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check exhibitors table columns
SELECT 
    'exhibitors' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for missing required fields in events
SELECT 
    'events' as table_name,
    'MISSING' as status,
    unnest(ARRAY[
        'address_line1',
        'address_standard', 
        'area_sq_ft',
        'kind_of_space',
        'latitude',
        'longitude',
        'formatted_address'
    ]) as missing_field
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name IN ('address_line1', 'address_standard', 'area_sq_ft', 'kind_of_space', 'latitude', 'longitude', 'formatted_address')
);

-- Check for missing required fields in exhibitors
SELECT 
    'exhibitors' as table_name,
    'MISSING' as status,
    unnest(ARRAY[
        'company_description',
        'designation',
        'business_type',
        'address',
        'state',
        'pincode',
        'booth_size',
        'expected_visitors'
    ]) as missing_field
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exhibitors' 
    AND column_name IN ('company_description', 'designation', 'business_type', 'address', 'state', 'pincode', 'booth_size', 'expected_visitors')
); 