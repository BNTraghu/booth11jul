-- Create Most Permissive Storage Policy
-- Run this in Supabase SQL Editor to fix image upload issues

-- =====================================================
-- STEP 1: Drop All Existing Policies
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
-- STEP 2: Create Most Permissive Policy
-- =====================================================

-- Create a policy that allows ALL operations for ANY bucket
CREATE POLICY "Allow all operations" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 3: Alternative - Create Individual Permissive Policies
-- =====================================================

-- If the above doesn't work, try these individual policies:

-- Allow INSERT (upload) for any bucket
CREATE POLICY "Allow all uploads" ON storage.objects
FOR INSERT WITH CHECK (true);

-- Allow SELECT (read) for any bucket
CREATE POLICY "Allow all reads" ON storage.objects
FOR SELECT USING (true);

-- Allow UPDATE for any bucket
CREATE POLICY "Allow all updates" ON storage.objects
FOR UPDATE USING (true) WITH CHECK (true);

-- Allow DELETE for any bucket
CREATE POLICY "Allow all deletes" ON storage.objects
FOR DELETE USING (true);

-- =====================================================
-- STEP 4: Verify Policies Created
-- =====================================================

-- Check if policies were created successfully
SELECT 
    'POLICIES CREATED' as info,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- =====================================================
-- STEP 5: Check Bucket Status
-- =====================================================

SELECT 
    'BUCKET STATUS' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
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
            AND policyname = 'Allow all operations'
        ) THEN '✅ Universal policy created'
        ELSE '❌ Universal policy missing'
    END as universal_policy_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' 
            AND policyname = 'Allow all uploads'
        ) THEN '✅ Upload policy created'
        ELSE '❌ Upload policy missing'
    END as upload_policy_status;
