-- Final Comprehensive Database Update Script
-- This script ensures all tables have the correct structure and constraints

-- =====================================================
-- VENUES TABLE - FINAL UPDATE
-- =====================================================

-- Add missing columns if they don't exist
ALTER TABLE venues ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_landmark text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_standard text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS area_sq_ft integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS kind_of_space text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_covered boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS pricing_per_day numeric;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS facility_area_sq_ft integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS no_of_stalls integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS facility_covered boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS no_of_flats integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS available_hours text DEFAULT '9:00 AM - 11:00 PM';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS parking_spaces integer DEFAULT 0;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS catering_allowed boolean DEFAULT true;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS alcohol_allowed boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS formatted_address text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS custom_contacts jsonb DEFAULT '[]'::jsonb;

-- =====================================================
-- EVENTS TABLE - FINAL UPDATE
-- =====================================================

-- Add missing columns if they don't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_date date;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_time time;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_image_url text;
-- Pricing & Availability fields for events
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_per_hour numeric DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS available_hours text DEFAULT '9:00 AM - 11:00 PM';
ALTER TABLE events ADD COLUMN IF NOT EXISTS parking_spaces integer DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS catering_allowed boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS alcohol_allowed boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false;

-- =====================================================
-- ADD UNIQUE CONSTRAINTS FOR DUPLICATE PREVENTION
-- =====================================================

-- Add unique constraint on venue name (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS venues_name_unique_idx ON venues (LOWER(name));

-- Add unique constraint on venue address (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS venues_address_unique_idx ON venues (LOWER(address_line1)) WHERE address_line1 IS NOT NULL AND address_line1 != '';

-- =====================================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Indexes for venues table
CREATE INDEX IF NOT EXISTS venues_status_idx ON venues (status);
CREATE INDEX IF NOT EXISTS venues_location_idx ON venues (location);
CREATE INDEX IF NOT EXISTS venues_capacity_idx ON venues (capacity);

-- Indexes for events table
CREATE INDEX IF NOT EXISTS events_status_idx ON events (status);
CREATE INDEX IF NOT EXISTS events_date_idx ON events (event_date);
CREATE INDEX IF NOT EXISTS events_venue_id_idx ON events (venue_id);
CREATE INDEX IF NOT EXISTS events_created_by_idx ON events (created_by);

-- =====================================================
-- ADD CHECK CONSTRAINTS FOR DATA VALIDATION
-- =====================================================

-- Venue capacity must be positive
ALTER TABLE venues ADD CONSTRAINT IF NOT EXISTS venues_capacity_positive CHECK (capacity > 0);

-- Venue pricing must be non-negative
ALTER TABLE venues ADD CONSTRAINT IF NOT EXISTS venues_pricing_non_negative CHECK (pricing_per_day >= 0);

-- Event capacity must be at least 10
ALTER TABLE venues ADD CONSTRAINT IF NOT EXISTS events_capacity_minimum CHECK (max_capacity >= 10);

-- Event dates must be valid
ALTER TABLE events ADD CONSTRAINT IF NOT EXISTS events_end_date_after_start CHECK (event_end_date >= event_date);

-- =====================================================
-- UPDATE EXISTING DATA (if needed)
-- =====================================================

-- Set default values for existing records
UPDATE venues SET 
  amenities = '{}'::text[],
  facilities = '{}'::text[]
WHERE amenities IS NULL OR facilities IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check venues table structure
SELECT 
    'VENUES TABLE STRUCTURE' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venues' 
ORDER BY ordinal_position;

-- Check events table structure
SELECT 
    'EVENTS TABLE STRUCTURE' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    'INDEXES' as info,
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('venues', 'events')
ORDER BY tablename, indexname;

-- Check constraints
SELECT 
    'CONSTRAINTS' as info,
    conname,
    conrelid::regclass as table_name,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid IN ('venues'::regclass, 'events'::regclass)
ORDER BY conrelid, conname;

-- =====================================================
-- FINAL STATUS
-- =====================================================

SELECT 'Database update completed successfully!' as status; 