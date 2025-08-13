-- Add photos and documents columns to venues for file uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'photos'
  ) THEN
    ALTER TABLE venues ADD COLUMN photos jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN venues.photos IS 'Array of photo objects: [{name, url, type, size}]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'documents'
  ) THEN
    ALTER TABLE venues ADD COLUMN documents jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN venues.documents IS 'Array of document objects: [{name, url, type, size}]';
  END IF;
END $$;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'venues' AND column_name IN ('photos','documents')
ORDER BY column_name; 