-- =====================================================
-- VERIFY STORAGE BUCKETS EXIST
-- =====================================================
-- Run this script to check if your storage buckets are properly configured

-- Check if buckets exist and their configuration
SELECT 
    name as bucket_name,
    public as is_public,
    file_size_limit,
    allowed_mime_types,
    CASE 
        WHEN name IN ('event-images', 'exhibitor-logos') THEN '✅ Found'
        ELSE '❌ Missing'
    END as status
FROM storage.buckets 
WHERE name IN ('event-images', 'exhibitor-logos')
ORDER BY name;

-- Check total number of buckets
SELECT 
    COUNT(*) as total_buckets,
    COUNT(CASE WHEN name = 'event-images' THEN 1 END) as event_images_bucket,
    COUNT(CASE WHEN name = 'exhibitor-logos' THEN 1 END) as exhibitor_logos_bucket
FROM storage.buckets;

-- Check storage policies for our buckets
SELECT 
    policyname,
    tablename,
    cmd,
    CASE 
        WHEN policyname LIKE '%event-images%' OR policyname LIKE '%exhibitor-logos%' THEN '✅ Our Policy'
        ELSE '❌ Other Policy'
    END as policy_type
FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%event-images%' OR policyname LIKE '%exhibitor-logos%')
ORDER BY policyname;

-- Summary
SELECT 
    CASE 
        WHEN COUNT(*) = 2 THEN '✅ Both buckets exist'
        WHEN COUNT(*) = 1 THEN '⚠️ Only one bucket exists'
        ELSE '❌ No buckets found'
    END as bucket_status,
    CASE 
        WHEN COUNT(CASE WHEN public = true THEN 1 END) = 2 THEN '✅ Both buckets are public'
        WHEN COUNT(CASE WHEN public = true THEN 1 END) = 1 THEN '⚠️ Only one bucket is public'
        ELSE '❌ No buckets are public'
    END as public_status
FROM storage.buckets 
WHERE name IN ('event-images', 'exhibitor-logos'); 