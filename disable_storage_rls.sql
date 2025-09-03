-- Disable Storage RLS Completely
-- Run this in Supabase SQL Editor to fix image upload issues

-- =====================================================
-- STEP 1: Check Current RLS Status
-- =====================================================

SELECT 
    'CURRENT RLS STATUS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- =====================================================
-- STEP 2: Drop All Existing Policies
-- =====================================================

-- Drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- =====================================================
-- STEP 3: Disable RLS on Storage Objects
-- =====================================================

-- Disable RLS completely
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Verify RLS is Disabled
-- =====================================================

SELECT 
    'RLS DISABLED STATUS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- =====================================================
-- STEP 5: Check Bucket Configuration
-- =====================================================

SELECT 
    'BUCKET CONFIG' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'event-images';

-- =====================================================
-- STEP 6: Test Upload Permissions
-- =====================================================

-- This will be tested from the application
-- With RLS disabled, uploads should work without any policy restrictions

-- =====================================================
-- FINAL STATUS
-- =====================================================

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = 'event-images' AND public = true
        ) THEN '✅ event-images bucket is public'
        ELSE '❌ event-images bucket not public'
    END as bucket_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'storage' AND tablename = 'objects' 
            AND rowsecurity = false
        ) THEN '✅ RLS disabled on storage.objects'
        ELSE '❌ RLS still enabled on storage.objects'
    END as rls_status,
    
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects'
        ) THEN '✅ All policies removed'
        ELSE '❌ Some policies still exist'
    END as policy_status;
