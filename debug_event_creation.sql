-- Debug Event Creation Issues
-- Run this to check what's wrong with Event creation

-- =====================================================
-- STEP 1: Check Current Events Table Structure
-- =====================================================

SELECT 
    'CURRENT EVENTS TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- =====================================================
-- STEP 2: Check for Missing Required Columns
-- =====================================================

SELECT 
    'MISSING COLUMNS CHECK' as check_type,
    column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = c.column_name
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status
FROM (
    VALUES 
        ('event_end_date'),
        ('event_end_time'),
        ('event_image_url'),
        ('layout_image_url'),
        ('price_per_hour'),
        ('available_hours'),
        ('parking_spaces'),
        ('catering_allowed'),
        ('alcohol_allowed'),
        ('smoking_allowed'),
        ('no_of_stalls'),
        ('in_site_stalls'),
        ('out_site_stalls'),
        ('all_stalls'),
        ('exhibitor_ids')
) AS c(column_name);

-- =====================================================
-- STEP 3: Test Basic Event Insertion
-- =====================================================

-- Try to insert a minimal event to see what fails
DO $$
DECLARE
    test_event_id uuid;
    error_message text;
BEGIN
    -- Insert minimal test event
    INSERT INTO events (
        title,
        description,
        event_date,
        event_time,
        venue_name,
        city,
        max_capacity,
        plan_type,
        status,
        attendees,
        total_revenue,
        created_by,
        vendor_ids
    ) VALUES (
        'Debug Test Event',
        'Testing minimal event creation',
        '2024-12-31',
        '18:00',
        'Test Venue',
        'Test City',
        100,
        'Plan A',
        'draft',
        0,
        0,
        NULL,
        '{}'
    ) RETURNING id INTO test_event_id;
    
    RAISE NOTICE '✅ SUCCESS: Minimal event created with ID: %', test_event_id;
    
    -- Clean up
    DELETE FROM events WHERE id = test_event_id;
    RAISE NOTICE '🧹 Test event cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        error_message := SQLERRM;
        RAISE NOTICE '❌ FAILED: Minimal event creation failed with error: %', error_message;
END $$;

-- =====================================================
-- STEP 4: Test Full Event Insertion
-- =====================================================

-- Try to insert a full event with all fields
DO $$
DECLARE
    test_event_id uuid;
    error_message text;
BEGIN
    -- Insert full test event
    INSERT INTO events (
        title,
        description,
        event_date,
        event_end_date,
        event_time,
        event_end_time,
        venue_name,
        city,
        max_capacity,
        plan_type,
        status,
        attendees,
        total_revenue,
        created_by,
        vendor_ids,
        exhibitor_ids,
        event_image_url,
        layout_image_url,
        price_per_hour,
        available_hours,
        parking_spaces,
        catering_allowed,
        alcohol_allowed,
        smoking_allowed,
        no_of_stalls,
        in_site_stalls,
        all_stalls
    ) VALUES (
        'Debug Full Test Event',
        'Testing full event creation with all fields',
        '2024-12-31',
        '2024-12-31',
        '18:00',
        '22:00',
        'Test Venue',
        'Test City',
        100,
        'Plan A',
        'draft',
        0,
        0,
        NULL,
        '{}',
        '{}',
        NULL,
        NULL,
        0,
        '9:00 AM - 11:00 PM',
        10,
        false,
        false,
        false,
        5,
        '[{"id":"1","stallNo":"A1","stallSize":"Medium","stallCategory":"General","price":1000}]',
        '{"A1"}'
    ) RETURNING id INTO test_event_id;
    
    RAISE NOTICE '✅ SUCCESS: Full event created with ID: %', test_event_id;
    
    -- Clean up
    DELETE FROM events WHERE id = test_event_id;
    RAISE NOTICE '🧹 Test event cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        error_message := SQLERRM;
        RAISE NOTICE '❌ FAILED: Full event creation failed with error: %', error_message;
END $$;

-- =====================================================
-- STEP 5: Check Table Constraints
-- =====================================================

SELECT 
    'TABLE CONSTRAINTS' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'events'::regclass;

-- =====================================================
-- STEP 6: Check for RLS Policies
-- =====================================================

SELECT 
    'RLS POLICIES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'events';

-- =====================================================
-- STEP 7: Check Table Permissions
-- =====================================================

SELECT 
    'TABLE PERMISSIONS' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'events';

-- =====================================================
-- FINAL DIAGNOSIS
-- =====================================================

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' 
            AND column_name IN ('event_end_date', 'event_end_time', 'no_of_stalls', 'in_site_stalls')
        ) THEN '✅ Database schema looks correct'
        ELSE '❌ Missing required columns'
    END as schema_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'events'
        ) THEN '⚠️ RLS policies exist - may need proper user permissions'
        ELSE '✅ No RLS policies found'
    END as rls_status;
