-- Update exhibitor table to support social_media_links as JSONB
-- Run this in your Supabase SQL editor

-- First, check if the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exhibitors' 
        AND column_name = 'social_media_links'
    ) THEN
        -- Add the social_media_links column as JSONB
        ALTER TABLE exhibitors 
        ADD COLUMN social_media_links JSONB DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Added social_media_links column as JSONB';
    ELSE
        RAISE NOTICE 'social_media_links column already exists';
    END IF;
END $$;

-- Remove old individual social media columns if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exhibitors' 
        AND column_name = 'facebook_url'
    ) THEN
        ALTER TABLE exhibitors DROP COLUMN facebook_url;
        RAISE NOTICE 'Removed facebook_url column';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exhibitors' 
        AND column_name = 'linkedin_url'
    ) THEN
        ALTER TABLE exhibitors DROP COLUMN linkedin_url;
        RAISE NOTICE 'Removed linkedin_url column';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exhibitors' 
        AND column_name = 'instagram_url'
    ) THEN
        ALTER TABLE exhibitors DROP COLUMN instagram_url;
        RAISE NOTICE 'Removed instagram_url column';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exhibitors' 
        AND column_name = 'twitter_url'
    ) THEN
        ALTER TABLE exhibitors DROP COLUMN twitter_url;
        RAISE NOTICE 'Removed twitter_url column';
    END IF;
END $$;

-- Add a GIN index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_exhibitors_social_media_links 
ON exhibitors USING GIN (social_media_links);

-- Verify the final structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
AND column_name IN ('social_media_links', 'facebook_url', 'linkedin_url', 'instagram_url', 'twitter_url')
ORDER BY column_name;

-- Show sample data structure
SELECT 
    id,
    company_name,
    social_media_links
FROM exhibitors 
WHERE social_media_links IS NOT NULL 
LIMIT 5;
