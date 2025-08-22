-- Setup Exhibitor Storage Buckets
-- This script creates storage buckets and policies for exhibitor documents and images

-- Create exhibitor-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('exhibitor-documents', 'exhibitor-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create exhibitor-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('exhibitor-images', 'exhibitor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for exhibitor-documents bucket
-- Policy for authenticated users to insert documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'auth insert exhibitor-documents'
  ) THEN
    CREATE POLICY "auth insert exhibitor-documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'exhibitor-documents' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Policy for public read access to documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'public read exhibitor-documents'
  ) THEN
    CREATE POLICY "public read exhibitor-documents"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'exhibitor-documents');
  END IF;
END $$;

-- Policy for authenticated users to update documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'auth update exhibitor-documents'
  ) THEN
    CREATE POLICY "auth update exhibitor-documents"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'exhibitor-documents' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Create RLS policies for exhibitor-images bucket
-- Policy for authenticated users to insert images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'auth insert exhibitor-images'
  ) THEN
    CREATE POLICY "auth insert exhibitor-images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'exhibitor-images' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Policy for public read access to images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'public read exhibitor-images'
  ) THEN
    CREATE POLICY "public read exhibitor-images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'exhibitor-images');
  END IF;
END $$;

-- Policy for authenticated users to update images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'auth update exhibitor-images'
  ) THEN
    CREATE POLICY "auth update exhibitor-images"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'exhibitor-images' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$; 