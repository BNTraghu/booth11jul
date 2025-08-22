-- Update Exhibitor Table for Personal Information Structure
-- This migration adds new fields for the personal information structure

DO $$
BEGIN
  -- Add personal information fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN last_name text;
  END IF;

  -- Add address fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'address1'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN address1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'address2'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN address2 text;
  END IF;

  -- Add business information fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'pan_number'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN pan_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'booth_size'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN booth_size text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'business_description'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN business_description text;
  END IF;

  -- Add social media fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'facebook_url'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN facebook_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN linkedin_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'instagram_url'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN instagram_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN twitter_url text;
  END IF;

  -- Add image URLs field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN image_urls jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add document URLs field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'document_urls'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN document_urls jsonb DEFAULT '{}'::jsonb;
  END IF;

END $$; 