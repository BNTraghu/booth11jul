-- Check Exhibitor Database Schema
-- This script checks the current exhibitor table structure and identifies missing fields

-- 1. Check current exhibitor table structure
SELECT 
    'Current Exhibitor Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
ORDER BY ordinal_position;

-- 2. List all expected fields from our TypeScript interface
SELECT 'Expected Fields from TypeScript Interface' as info;

-- Company Information fields
SELECT 'company_name' as expected_field, 'text' as expected_type UNION ALL
SELECT 'company_description', 'text' UNION ALL
SELECT 'established_year', 'text' UNION ALL
SELECT 'company_size', 'text' UNION ALL
SELECT 'website', 'text' UNION ALL

-- Contact Information fields
SELECT 'contact_person', 'text' UNION ALL
SELECT 'designation', 'text' UNION ALL
SELECT 'email', 'text' UNION ALL
SELECT 'phone', 'text' UNION ALL
SELECT 'alternate_phone', 'text' UNION ALL
SELECT 'alternate_email', 'text' UNION ALL

-- Business Details fields
SELECT 'category', 'text' UNION ALL
SELECT 'sub_category', 'text' UNION ALL
SELECT 'business_type', 'text' UNION ALL
SELECT 'gst_number', 'text' UNION ALL
SELECT 'pan_number', 'text' UNION ALL

-- Location & Address fields
SELECT 'address', 'text' UNION ALL
SELECT 'city', 'text' UNION ALL
SELECT 'state', 'text' UNION ALL
SELECT 'pincode', 'text' UNION ALL
SELECT 'country', 'text' UNION ALL

-- Exhibition Details fields
SELECT 'booth_preference', 'text' UNION ALL
SELECT 'booth_size', 'text' UNION ALL
SELECT 'special_requirements', 'text' UNION ALL
SELECT 'previous_exhibitions', 'text' UNION ALL
SELECT 'expected_visitors', 'text' UNION ALL

-- Products & Services fields
SELECT 'products', 'text[]' UNION ALL
SELECT 'services', 'text[]' UNION ALL
SELECT 'target_audience', 'text' UNION ALL

-- Payment & Billing fields
SELECT 'registration_fee', 'numeric' UNION ALL
SELECT 'payment_method', 'text' UNION ALL
SELECT 'billing_address', 'text' UNION ALL

-- Additional Information fields
SELECT 'social_media_links', 'jsonb' UNION ALL

-- Settings fields
SELECT 'status', 'text' UNION ALL
SELECT 'payment_status', 'text' UNION ALL
SELECT 'send_confirmation_email', 'boolean' UNION ALL
SELECT 'allow_marketing_emails', 'boolean' UNION ALL

-- Legacy fields
SELECT 'booth', 'text' UNION ALL
SELECT 'registration_date', 'timestamp' UNION ALL

-- System fields
SELECT 'created_at', 'timestamp' UNION ALL
SELECT 'updated_at', 'timestamp';

-- 3. Find missing fields
SELECT 
    'MISSING FIELDS' as status,
    e.expected_field,
    e.expected_type,
    CASE 
        WHEN c.column_name IS NULL THEN 'MISSING'
        ELSE 'EXISTS'
    END as field_status
FROM (
    SELECT 'company_name' as expected_field, 'text' as expected_type UNION ALL
    SELECT 'company_description', 'text' UNION ALL
    SELECT 'established_year', 'text' UNION ALL
    SELECT 'company_size', 'text' UNION ALL
    SELECT 'website', 'text' UNION ALL
    SELECT 'contact_person', 'text' UNION ALL
    SELECT 'designation', 'text' UNION ALL
    SELECT 'email', 'text' UNION ALL
    SELECT 'phone', 'text' UNION ALL
    SELECT 'alternate_phone', 'text' UNION ALL
    SELECT 'alternate_email', 'text' UNION ALL
    SELECT 'category', 'text' UNION ALL
    SELECT 'sub_category', 'text' UNION ALL
    SELECT 'business_type', 'text' UNION ALL
    SELECT 'gst_number', 'text' UNION ALL
    SELECT 'pan_number', 'text' UNION ALL
    SELECT 'address', 'text' UNION ALL
    SELECT 'city', 'text' UNION ALL
    SELECT 'state', 'text' UNION ALL
    SELECT 'pincode', 'text' UNION ALL
    SELECT 'country', 'text' UNION ALL
    SELECT 'booth_preference', 'text' UNION ALL
    SELECT 'booth_size', 'text' UNION ALL
    SELECT 'special_requirements', 'text' UNION ALL
    SELECT 'previous_exhibitions', 'text' UNION ALL
    SELECT 'expected_visitors', 'text' UNION ALL
    SELECT 'products', 'text[]' UNION ALL
    SELECT 'services', 'text[]' UNION ALL
    SELECT 'target_audience', 'text' UNION ALL
    SELECT 'registration_fee', 'numeric' UNION ALL
    SELECT 'payment_method', 'text' UNION ALL
    SELECT 'billing_address', 'text' UNION ALL
    SELECT 'social_media_links', 'jsonb' UNION ALL
    SELECT 'status', 'text' UNION ALL
    SELECT 'payment_status', 'text' UNION ALL
    SELECT 'send_confirmation_email', 'boolean' UNION ALL
    SELECT 'allow_marketing_emails', 'boolean' UNION ALL
    SELECT 'booth', 'text' UNION ALL
    SELECT 'registration_date', 'timestamp' UNION ALL
    SELECT 'created_at', 'timestamp' UNION ALL
    SELECT 'updated_at', 'timestamp'
) e
LEFT JOIN information_schema.columns c ON c.table_name = 'exhibitors' AND c.column_name = e.expected_field
WHERE c.column_name IS NULL
ORDER BY e.expected_field;

-- 4. Check if table exists
SELECT 
    'Table Check' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exhibitors') 
        THEN 'exhibitors table EXISTS' 
        ELSE 'exhibitors table MISSING' 
    END as table_status;

-- 5. Check RLS policies
SELECT 
    'RLS Policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'exhibitors'; 