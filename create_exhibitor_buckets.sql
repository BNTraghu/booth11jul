-- Create exhibitor storage buckets in Supabase
-- Run this in your Supabase SQL editor

-- Create exhibitor-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exhibitor-images',
  'exhibitor-images',
  false, -- Keep private for security
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create exhibitor-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exhibitor-documents',
  'exhibitor-documents',
  false, -- Keep private for security
  10485760, -- 10MB file size limit for documents
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for exhibitor-images bucket
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exhibitor-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'exhibitor-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'exhibitor-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'exhibitor-images' 
  AND auth.role() = 'authenticated'
);

-- Set up storage policies for exhibitor-documents bucket
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exhibitor-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'exhibitor-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'exhibitor-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'exhibitor-documents' 
  AND auth.role() = 'authenticated'
);

-- Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('exhibitor-images', 'exhibitor-documents');
