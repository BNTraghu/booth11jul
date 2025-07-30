-- Check Current Database Schema
-- Run this to see what columns exist in your tables

-- =====================================================
-- CHECK VENUES TABLE
-- =====================================================

SELECT 
    'VENUES TABLE' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venues' 
ORDER BY ordinal_position;

-- =====================================================
-- CHECK EVENTS TABLE
-- =====================================================

SELECT 
    'EVENTS TABLE' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- =====================================================
-- CHECK FOR MISSING COLUMNS
-- =====================================================

-- Check if amenities column exists in venues
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'venues' AND column_name = 'amenities'
        ) 
        THEN 'amenities column EXISTS in venues' 
        ELSE 'amenities column MISSING in venues' 
    END as status;

-- Check if event_end_date column exists in events
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'event_end_date'
        ) 
        THEN 'event_end_date column EXISTS in events' 
        ELSE 'event_end_date column MISSING in events' 
    END as status;

-- Check if event_end_time column exists in events
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'event_end_time'
        ) 
        THEN 'event_end_time column EXISTS in events' 
        ELSE 'event_end_time column MISSING in events' 
    END as status;

-- Check if event_image_url column exists in events
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'event_image_url'
        ) 
        THEN 'event_image_url column EXISTS in events' 
        ELSE 'event_image_url column MISSING in events' 
    END as status; 