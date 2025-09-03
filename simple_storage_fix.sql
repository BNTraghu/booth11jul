-- Simple Storage RLS Fix
-- Run this in Supabase SQL Editor to fix image upload issues

-- =====================================================
-- STEP 1: Drop Existing Restrictive Policies
-- =====================================================

-- Drop any existing policies that might be blocking uploads
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket access" ON storage.objects;

-- =====================================================
-- STEP 2: Create Simple Public Access Policies
-- =====================================================

-- Allow anyone to upload to public buckets
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- Allow anyone to read from public buckets
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- Allow anyone to update files in public buckets
CREATE POLICY "Public update access" ON storage.objects
FOR UPDATE USING (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- Allow anyone to delete files from public buckets
CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE USING (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- =====================================================
-- STEP 3: Verify the Fix
-- =====================================================

-- Check if policies were created
SELECT 
    'POLICIES CREATED' as info,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check bucket status
SELECT 
    'BUCKET STATUS' as info,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE name = 'event-images';

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
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' 
            AND policyname = 'Public upload access'
        ) THEN '✅ Upload policy created'
        ELSE '❌ Upload policy missing'
    END as upload_policy_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' 
            AND policyname = 'Public read access'
        ) THEN '✅ Read policy created'
        ELSE '❌ Read policy missing'
    END as read_policy_status;
