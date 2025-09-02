-- Test script to check exhibitor table structure and social media links
-- Run this in your Supabase SQL editor

-- 1. Check current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
ORDER BY ordinal_position;

-- 2. Check if social_media_links column exists and its type
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
AND column_name = 'social_media_links';

-- 3. Check current data in social_media_links column
SELECT 
    id,
    company_name,
    social_media_links,
    CASE 
        WHEN social_media_links IS NULL THEN 'NULL'
        WHEN jsonb_typeof(social_media_links) = 'object' THEN 'JSONB Object'
        ELSE 'Other: ' || jsonb_typeof(social_media_links)
    END as data_type
FROM exhibitors 
LIMIT 10;

-- 4. Test inserting a sample exhibitor with social media links
INSERT INTO exhibitors (
    company_name,
    first_name,
    last_name,
    email,
    phone,
    social_media_links
) VALUES (
    'Test Company Social Media',
    'John',
    'Doe',
    'john.social@test.com',
    '1234567890',
    '{
        "facebook": "https://facebook.com/testcompany",
        "linkedin": "https://linkedin.com/company/testcompany",
        "instagram": "https://instagram.com/testcompany",
        "twitter": "https://twitter.com/testcompany"
    }'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- 5. Verify the inserted data
SELECT 
    id,
    company_name,
    social_media_links,
    social_media_links->>'facebook' as facebook_url,
    social_media_links->>'linkedin' as linkedin_url,
    social_media_links->>'instagram' as instagram_url,
    social_media_links->>'twitter' as twitter_url
FROM exhibitors 
WHERE email = 'john.social@test.com';

-- 6. Test updating social media links
UPDATE exhibitors 
SET social_media_links = '{
    "facebook": "https://facebook.com/updatedcompany",
    "linkedin": "https://linkedin.com/company/updatedcompany",
    "instagram": "https://instagram.com/updatedcompany",
    "twitter": "https://twitter.com/updatedcompany"
}'::jsonb
WHERE email = 'john.social@test.com';

-- 7. Verify the updated data
SELECT 
    id,
    company_name,
    social_media_links,
    social_media_links->>'facebook' as facebook_url,
    social_media_links->>'linkedin' as linkedin_url,
    social_media_links->>'instagram' as instagram_url,
    social_media_links->>'twitter' as twitter_url
FROM exhibitors 
WHERE email = 'john.social@test.com';

-- 8. Clean up test data
DELETE FROM exhibitors WHERE email = 'john.social@test.com';

-- 9. Show final structure
SELECT 
    'Final Table Structure' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
AND column_name IN ('social_media_links', 'facebook_url', 'linkedin_url', 'instagram_url', 'twitter_url')
ORDER BY column_name;
