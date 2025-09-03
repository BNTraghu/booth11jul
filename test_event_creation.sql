-- Test Event Creation - Run this after fix_events_database.sql
-- This script tests if Event creation will work properly

-- =====================================================
-- TEST 1: Check if all required columns exist
-- =====================================================

SELECT 
    'MISSING COLUMNS CHECK' as test_type,
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
-- TEST 2: Test Event Insertion
-- =====================================================

-- Try to insert a test event
DO $$
DECLARE
    test_event_id uuid;
    insert_success boolean := false;
BEGIN
    -- Insert test event
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
        'Database Test Event',
        'This event tests if the database schema is correct',
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
    
    -- If we get here, insertion was successful
    insert_success := true;
    
    -- Display success message
    RAISE NOTICE '✅ SUCCESS: Test event created with ID: %', test_event_id;
    
    -- Clean up test data
    DELETE FROM events WHERE id = test_event_id;
    RAISE NOTICE '🧹 Test event cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        -- If insertion failed, show the error
        RAISE NOTICE '❌ FAILED: Event creation failed with error: %', SQLERRM;
        insert_success := false;
END $$;

-- =====================================================
-- TEST 3: Verify Table Structure
-- =====================================================

-- Show current events table structure
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
-- FINAL STATUS
-- =====================================================

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' 
            AND column_name IN ('event_end_date', 'event_end_time', 'no_of_stalls', 'in_site_stalls')
        ) THEN '✅ READY: Events database is properly configured for Event creation'
        ELSE '❌ NOT READY: Missing required columns in events table'
    END as final_status;
