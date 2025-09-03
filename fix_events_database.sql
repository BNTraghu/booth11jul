-- Fix Events Database Schema for Event Creation
-- Run this in your Supabase SQL Editor to fix Event creation issues

-- =====================================================
-- EVENTS TABLE - COMPLETE FIX
-- =====================================================

-- Add all missing columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_end_date date,
ADD COLUMN IF NOT EXISTS event_end_time time,
ADD COLUMN IF NOT EXISTS event_image_url text,
ADD COLUMN IF NOT EXISTS layout_image_url text,
ADD COLUMN IF NOT EXISTS price_per_hour numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_hours text DEFAULT '9:00 AM - 11:00 PM',
ADD COLUMN IF NOT EXISTS parking_spaces integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS catering_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS alcohol_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS no_of_stalls integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS in_site_stalls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS out_site_stalls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS all_stalls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS exhibitor_ids text[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN events.event_end_date IS 'End date of the event';
COMMENT ON COLUMN events.event_end_time IS 'End time of the event';
COMMENT ON COLUMN events.event_image_url IS 'URL of the event image';
COMMENT ON COLUMN events.layout_image_url IS 'URL of the layout image';
COMMENT ON COLUMN events.price_per_hour IS 'Price per hour for venue rental';
COMMENT ON COLUMN events.available_hours IS 'Available hours for the event';
COMMENT ON COLUMN events.parking_spaces IS 'Number of parking spaces available';
COMMENT ON COLUMN events.catering_allowed IS 'Whether catering is allowed';
COMMENT ON COLUMN events.alcohol_allowed IS 'Whether alcohol is allowed';
COMMENT ON COLUMN events.smoking_allowed IS 'Whether smoking is allowed';
COMMENT ON COLUMN events.no_of_stalls IS 'Number of planned stalls for the event';
COMMENT ON COLUMN events.in_site_stalls IS 'Detailed stall configurations for in-site stalls';
COMMENT ON COLUMN events.out_site_stalls IS 'Detailed stall configurations for out-site stalls';
COMMENT ON COLUMN events.all_stalls IS 'Array of stall numbers';
COMMENT ON COLUMN events.exhibitor_ids IS 'Array of exhibitor IDs';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_end_date_idx ON events (event_end_date);
CREATE INDEX IF NOT EXISTS events_status_idx ON events (status);
CREATE INDEX IF NOT EXISTS events_venue_id_idx ON events (venue_id);
CREATE INDEX IF NOT EXISTS events_created_by_idx ON events (created_by);

-- Add constraints (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_no_of_stalls') THEN
        ALTER TABLE events ADD CONSTRAINT check_no_of_stalls CHECK (no_of_stalls >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_price_per_hour') THEN
        ALTER TABLE events ADD CONSTRAINT check_price_per_hour CHECK (price_per_hour >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_parking_spaces') THEN
        ALTER TABLE events ADD CONSTRAINT check_parking_spaces CHECK (parking_spaces >= 0);
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all required columns exist
SELECT 
    'EVENTS TABLE COLUMNS' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN (
    'event_end_date',
    'event_end_time', 
    'event_image_url',
    'layout_image_url',
    'price_per_hour',
    'available_hours',
    'parking_spaces',
    'catering_allowed',
    'alcohol_allowed',
    'smoking_allowed',
    'no_of_stalls',
    'in_site_stalls',
    'out_site_stalls',
    'all_stalls',
    'exhibitor_ids'
)
ORDER BY column_name;

-- =====================================================
-- TEST EVENT CREATION
-- =====================================================

-- Test inserting a sample event to verify the schema works
INSERT INTO events (
    title,
    description,
    event_date,
    event_end_date,
    event_time,
    event_end_time,
    venue_name,
    city,
    max_capacity,
    plan_type,
    status,
    attendees,
    total_revenue,
    created_by,
    vendor_ids,
    exhibitor_ids,
    event_image_url,
    layout_image_url,
    price_per_hour,
    available_hours,
    parking_spaces,
    catering_allowed,
    alcohol_allowed,
    smoking_allowed,
    no_of_stalls,
    in_site_stalls,
    all_stalls
) VALUES (
    'Test Event - Delete Me',
    'This is a test event to verify the database schema',
    '2024-12-31',
    '2024-12-31',
    '18:00',
    '22:00',
    'Test Venue',
    'Test City',
    100,
    'Plan A',
    'draft',
    0,
    0,
    NULL,
    '{}',
    '{}',
    NULL,
    NULL,
    0,
    '9:00 AM - 11:00 PM',
    10,
    false,
    false,
    false,
    5,
    '[{"id":"1","stallNo":"A1","stallSize":"Medium","stallCategory":"General","price":1000}]',
    '{"A1"}'
);

-- Verify the test event was created
SELECT 
    'TEST EVENT CREATED' as status,
    id,
    title,
    event_date,
    event_end_date,
    no_of_stalls,
    in_site_stalls,
    all_stalls
FROM events 
WHERE title = 'Test Event - Delete Me';

-- Clean up test data
DELETE FROM events WHERE title = 'Test Event - Delete Me';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Events database schema fixed successfully! Event creation should now work.' as status;
