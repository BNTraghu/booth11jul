-- Fix Events Table RLS Policies
-- Run this in Supabase SQL Editor to fix event creation issues

-- =====================================================
-- STEP 1: Check Current Events RLS Status
-- =====================================================

SELECT 
    'EVENTS RLS STATUS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';

-- =====================================================
-- STEP 2: Check Current Events RLS Policies
-- =====================================================

SELECT 
    'EVENTS RLS POLICIES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'events';

-- =====================================================
-- STEP 3: Drop Existing Restrictive Policies
-- =====================================================

-- Drop any existing policies that might be blocking inserts
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable update for users based on email" ON events;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON events;
DROP POLICY IF EXISTS "Public read access" ON events;
DROP POLICY IF EXISTS "Authenticated insert access" ON events;

-- =====================================================
-- STEP 4: Create Permissive Events Policies
-- =====================================================

-- Allow anyone to insert events
CREATE POLICY "Allow all inserts" ON events
FOR INSERT WITH CHECK (true);

-- Allow anyone to read events
CREATE POLICY "Allow all reads" ON events
FOR SELECT USING (true);

-- Allow anyone to update events
CREATE POLICY "Allow all updates" ON events
FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anyone to delete events
CREATE POLICY "Allow all deletes" ON events
FOR DELETE USING (true);

-- =====================================================
-- STEP 5: Alternative - Disable RLS on Events
-- =====================================================

-- If policies don't work, try disabling RLS completely
-- ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Verify Events Table Structure
-- =====================================================

SELECT 
    'EVENTS TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- =====================================================
-- STEP 7: Test Event Insertion
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
        'Test Event RLS Fix',
        'Testing event creation after RLS fix',
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
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'events' 
            AND policyname = 'Allow all inserts'
        ) THEN '✅ Insert policy created'
        ELSE '❌ Insert policy missing'
    END as insert_policy_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'events' 
            AND policyname = 'Allow all reads'
        ) THEN '✅ Read policy created'
        ELSE '❌ Read policy missing'
    END as read_policy_status;
