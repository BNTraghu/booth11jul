-- Reliable storage for exhibitor gallery URLs + public exhibitor-images bucket policies
-- Run against your Supabase project if images are missing or image_urls was plain text.

-- 1) portfolio_image_url (idempotent)
ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS portfolio_image_url text;

-- 2) image_urls as jsonb array of URL strings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE public.exhibitors
      ADD COLUMN image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = 'exhibitors'
      AND c.column_name = 'image_urls'
      AND c.data_type IN ('text', 'character varying')
  ) THEN
    ALTER TABLE public.exhibitors
      ALTER COLUMN image_urls TYPE jsonb USING (
        CASE
          WHEN image_urls IS NULL OR btrim(image_urls::text) = '' THEN '[]'::jsonb
          ELSE COALESCE(NULLIF(btrim(image_urls::text), '')::jsonb, '[]'::jsonb)
        END
      );
    ALTER TABLE public.exhibitors ALTER COLUMN image_urls SET DEFAULT '[]'::jsonb;
    UPDATE public.exhibitors SET image_urls = '[]'::jsonb WHERE image_urls IS NULL;
    ALTER TABLE public.exhibitors ALTER COLUMN image_urls SET NOT NULL;
  END IF;
END $$;

-- 3) Storage bucket (public read so getPublicUrl works for Admin + consumers)
INSERT INTO storage.buckets (id, name, public)
VALUES ('exhibitor-images', 'exhibitor-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4) Policies on storage.objects (safe to re-run)
DROP POLICY IF EXISTS "exhibitor_images_public_read" ON storage.objects;
CREATE POLICY "exhibitor_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exhibitor-images');

DROP POLICY IF EXISTS "exhibitor_images_authenticated_insert" ON storage.objects;
CREATE POLICY "exhibitor_images_authenticated_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exhibitor-images');

DROP POLICY IF EXISTS "exhibitor_images_authenticated_update" ON storage.objects;
CREATE POLICY "exhibitor_images_authenticated_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'exhibitor-images')
  WITH CHECK (bucket_id = 'exhibitor-images');

DROP POLICY IF EXISTS "exhibitor_images_authenticated_delete" ON storage.objects;
CREATE POLICY "exhibitor_images_authenticated_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'exhibitor-images');
