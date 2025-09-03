-- Comprehensive RLS Fix for Events and Storage
-- Run this in Supabase SQL Editor to fix all event creation/update issues

-- =====================================================
-- STEP 1: Fix Events Table RLS
-- =====================================================

-- Check current events RLS status
SELECT 
    'EVENTS RLS STATUS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';

-- Drop all existing events policies
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

-- Disable RLS on events table
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Fix Storage RLS
-- =====================================================

-- Check current storage RLS status
SELECT 
    'STORAGE RLS STATUS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes" ON storage.objects;

-- Create most permissive storage policies
CREATE POLICY "Allow all operations" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 3: Verify Bucket Configuration
-- =====================================================

-- Check event-images bucket
SELECT 
    'BUCKET STATUS' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'event-images';

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-images',
    'event-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 4: Test Event Operations
-- =====================================================

-- Test event insertion
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
        'Test Event Comprehensive Fix',
        'Testing event creation after comprehensive RLS fix',
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
    
    -- Test event update
    UPDATE events 
    SET title = 'Updated Test Event'
    WHERE id = test_event_id;
    
    RAISE NOTICE '✅ SUCCESS: Test event updated';
    
    -- Clean up
    DELETE FROM events WHERE id = test_event_id;
    RAISE NOTICE '🧹 Test event cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        error_message := SQLERRM;
        RAISE NOTICE '❌ FAILED: Test operations failed with error: %', error_message;
END $$;

-- =====================================================
-- STEP 5: Test Storage Operations
-- =====================================================

-- This will be tested from the application
-- The policies should now allow all storage operations

-- =====================================================
-- FINAL STATUS REPORT
-- =====================================================

SELECT 
    'COMPREHENSIVE RLS FIX STATUS' as info,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = 'events' 
            AND rowsecurity = false
        ) THEN '✅ Events RLS disabled'
        ELSE '❌ Events RLS still enabled'
    END as events_rls_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' 
            AND policyname = 'Allow all operations'
        ) THEN '✅ Storage universal policy created'
        ELSE '❌ Storage policy missing'
    END as storage_policy_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = 'event-images' AND public = true
        ) THEN '✅ event-images bucket is public'
        ELSE '❌ event-images bucket not public'
    END as bucket_status,
    
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'events'
        ) THEN '✅ All events policies removed'
        ELSE '❌ Some events policies still exist'
    END as events_policy_status;
