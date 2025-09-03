-- Disable RLS on Events Table Completely
-- Run this in Supabase SQL Editor to fix event creation issues

-- =====================================================
-- STEP 1: Check Current RLS Status
-- =====================================================

SELECT 
    'CURRENT RLS STATUS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';

-- =====================================================
-- STEP 2: Drop All Existing Policies
-- =====================================================

-- Drop all existing policies on events table
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable update for users based on email" ON events;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON events;
DROP POLICY IF EXISTS "Public read access" ON events;
DROP POLICY IF EXISTS "Authenticated insert access" ON events;
DROP POLICY IF EXISTS "Allow all inserts" ON events;
DROP POLICY IF EXISTS "Allow all reads" ON events;
DROP POLICY IF EXISTS "Allow all updates" ON events;
DROP POLICY IF EXISTS "Allow all deletes" ON events;

-- =====================================================
-- STEP 3: Disable RLS on Events Table
-- =====================================================

-- Disable RLS completely
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Verify RLS is Disabled
-- =====================================================

SELECT 
    'RLS DISABLED STATUS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';

-- =====================================================
-- STEP 5: Test Event Insertion
-- =====================================================

-- Test inserting a minimal event
DO $$
DECLARE
    test_event_id uuid;
    error_message text;
BEGIN
    -- Insert test event
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
        'Test Event No RLS',
        'Testing event creation with RLS disabled',
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
        0,
        '[]',
        '[]'
    ) RETURNING id INTO test_event_id;
    
    RAISE NOTICE '✅ SUCCESS: Test event created with ID: %', test_event_id;
    
    -- Clean up
    DELETE FROM events WHERE id = test_event_id;
    RAISE NOTICE '🧹 Test event cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        error_message := SQLERRM;
        RAISE NOTICE '❌ FAILED: Test event creation failed with error: %', error_message;
END $$;

-- =====================================================
-- STEP 6: Check Table Permissions
-- =====================================================

SELECT 
    'TABLE PERMISSIONS' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'events';

-- =====================================================
-- FINAL STATUS
-- =====================================================

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = 'events'
        ) THEN '✅ events table exists'
        ELSE '❌ events table missing'
    END as table_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = 'events' 
            AND rowsecurity = false
        ) THEN '✅ RLS disabled on events table'
        ELSE '❌ RLS still enabled on events table'
    END as rls_status,
    
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'events'
        ) THEN '✅ All policies removed'
        ELSE '❌ Some policies still exist'
    END as policy_status;
