-- Fix Storage Bucket RLS Policies
-- Run this in Supabase SQL Editor to fix image upload issues

-- =====================================================
-- STEP 1: Check Current Storage Buckets
-- =====================================================

SELECT 
    'STORAGE BUCKETS' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets;

-- =====================================================
-- STEP 2: Check Current RLS Policies on Storage
-- =====================================================

SELECT 
    'STORAGE RLS POLICIES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- =====================================================
-- STEP 3: Create event-images Bucket if Not Exists
-- =====================================================

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
-- STEP 4: Drop Existing RLS Policies (if any)
-- =====================================================

-- Drop existing policies that might be blocking uploads
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;

-- =====================================================
-- STEP 5: Create New RLS Policies for Public Access
-- =====================================================

-- Policy 1: Allow anyone to upload files to public buckets
CREATE POLICY "Anyone can upload to public buckets" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- Policy 2: Allow anyone to read files from public buckets
CREATE POLICY "Anyone can read from public buckets" ON storage.objects
FOR SELECT USING (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- Policy 3: Allow anyone to update files in public buckets
CREATE POLICY "Anyone can update public bucket files" ON storage.objects
FOR UPDATE USING (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- Policy 4: Allow anyone to delete files from public buckets
CREATE POLICY "Anyone can delete from public buckets" ON storage.objects
FOR DELETE USING (
    bucket_id IN (
        SELECT id FROM storage.buckets WHERE public = true
    )
);

-- =====================================================
-- STEP 6: Enable RLS on Storage Objects (if not enabled)
-- =====================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: Verify the Fix
-- =====================================================

-- Check if policies were created successfully
SELECT 
    'VERIFICATION - RLS POLICIES' as info,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check bucket configuration
SELECT 
    'VERIFICATION - BUCKET CONFIG' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'event-images';

-- =====================================================
-- STEP 8: Test File Upload (Optional)
-- =====================================================

-- This will be tested from the application
-- The policies should now allow public uploads to event-images bucket

-- =====================================================
-- FINAL STATUS
-- =====================================================

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = 'event-images' AND public = true
        ) THEN '✅ event-images bucket is public'
        ELSE '❌ event-images bucket not found or not public'
    END as bucket_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' 
            AND policyname = 'Anyone can upload to public buckets'
        ) THEN '✅ Upload policy created'
        ELSE '❌ Upload policy missing'
    END as upload_policy_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' 
            AND policyname = 'Anyone can read from public buckets'
        ) THEN '✅ Read policy created'
        ELSE '❌ Read policy missing'
    END as read_policy_status;
