-- =====================================================
-- SUPABASE STORAGE SETUP SCRIPT
-- =====================================================
-- This script sets up storage buckets and policies for image uploads
-- Run this in your Supabase SQL Editor

-- =====================================================
-- CREATE STORAGE BUCKETS (if they don't exist)
-- =====================================================

-- Note: Buckets must be created manually in the Supabase Dashboard
-- Go to Storage > Create a new bucket
-- Create: event-images (public bucket, 5MB limit, image/* MIME types)
-- Create: exhibitor-logos (public bucket, 5MB limit, image/* MIME types)

-- =====================================================
-- STORAGE POLICIES FOR EVENT IMAGES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads to event-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing of event-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to event-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from event-images" ON storage.objects;

-- Create new policies for event-images bucket
CREATE POLICY "Allow authenticated uploads to event-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public viewing of event-images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Allow authenticated updates to event-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated deletes from event-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' AND 
  auth.role() = 'authenticated'
);

-- =====================================================
-- STORAGE POLICIES FOR EXHIBITOR LOGOS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads to exhibitor-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing of exhibitor-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to exhibitor-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from exhibitor-logos" ON storage.objects;

-- Create new policies for exhibitor-logos bucket
CREATE POLICY "Allow authenticated uploads to exhibitor-logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exhibitor-logos' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public viewing of exhibitor-logos" ON storage.objects
FOR SELECT USING (bucket_id = 'exhibitor-logos');

CREATE POLICY "Allow authenticated updates to exhibitor-logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'exhibitor-logos' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated deletes from exhibitor-logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'exhibitor-logos' AND 
  auth.role() = 'authenticated'
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if buckets exist
SELECT 
    name as bucket_name,
    public as is_public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name IN ('event-images', 'exhibitor-logos');

-- Check if policies exist
SELECT 
    policyname,
    tablename,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%event-images%' OR policyname LIKE '%exhibitor-logos%';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Storage setup completed successfully!' as status; 