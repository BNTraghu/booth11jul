-- Add layout_image_url field to events table
-- This migration adds a field to store the URL of uploaded stall layout images

DO $$
BEGIN
  -- Add layout_image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'layout_image_url'
  ) THEN
    ALTER TABLE public.events ADD COLUMN layout_image_url text;
    PRINT 'Added layout_image_url column to events table';
  ELSE
    PRINT 'layout_image_url column already exists in events table';
  END IF;
END $$; 