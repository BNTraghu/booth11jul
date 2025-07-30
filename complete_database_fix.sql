-- Complete Database Schema Fix for Venues and Events Tables
-- Run this in your Supabase SQL Editor

-- ========================================
-- VENUES TABLE FIXES
-- ========================================

-- Add missing columns to venues table
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS address_landmark text,
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_standard text,
ADD COLUMN IF NOT EXISTS area_sq_ft numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS kind_of_space text,
ADD COLUMN IF NOT EXISTS is_covered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pricing_per_day numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS facility_area_sq_ft numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_of_stalls integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS facility_covered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS no_of_flats integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS formatted_address text,
ADD COLUMN IF NOT EXISTS custom_contacts jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS available_hours text DEFAULT '9:00 AM - 11:00 PM',
ADD COLUMN IF NOT EXISTS parking_spaces integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS catering_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS alcohol_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false;

-- Add amenities and facilities columns if they don't exist
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS facilities text[] DEFAULT '{}';

-- ========================================
-- EVENTS TABLE FIXES
-- ========================================

-- Add missing columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_end_date date,
ADD COLUMN IF NOT EXISTS event_end_time time,
ADD COLUMN IF NOT EXISTS event_image_url text,
ADD COLUMN IF NOT EXISTS price_per_hour numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_hours text DEFAULT '9:00 AM - 11:00 PM',
ADD COLUMN IF NOT EXISTS parking_spaces integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS catering_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS alcohol_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vendor_ids text[] DEFAULT '{}';

-- ========================================
-- CONSTRAINTS AND INDEXES
-- ========================================

-- Add unique constraints for venues
CREATE UNIQUE INDEX IF NOT EXISTS venues_name_unique ON venues(name);
CREATE UNIQUE INDEX IF NOT EXISTS venues_address_unique ON venues(address_line1, address_standard);

-- Add check constraints for venues (without IF NOT EXISTS)
DO $$ 
BEGIN
    -- Venues constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_area_sq_ft') THEN
        ALTER TABLE venues ADD CONSTRAINT check_area_sq_ft CHECK (area_sq_ft >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_pricing_per_day') THEN
        ALTER TABLE venues ADD CONSTRAINT check_pricing_per_day CHECK (pricing_per_day >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_facility_area_sq_ft') THEN
        ALTER TABLE venues ADD CONSTRAINT check_facility_area_sq_ft CHECK (facility_area_sq_ft >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_no_of_stalls') THEN
        ALTER TABLE venues ADD CONSTRAINT check_no_of_stalls CHECK (no_of_stalls >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_no_of_flats') THEN
        ALTER TABLE venues ADD CONSTRAINT check_no_of_flats CHECK (no_of_flats >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_parking_spaces_venues') THEN
        ALTER TABLE venues ADD CONSTRAINT check_parking_spaces_venues CHECK (parking_spaces >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_capacity') THEN
        ALTER TABLE venues ADD CONSTRAINT check_capacity CHECK (capacity > 0);
    END IF;
    
    -- Events constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_price_per_hour') THEN
        ALTER TABLE events ADD CONSTRAINT check_price_per_hour CHECK (price_per_hour >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_parking_spaces_events') THEN
        ALTER TABLE events ADD CONSTRAINT check_parking_spaces_events CHECK (parking_spaces >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_max_capacity') THEN
        ALTER TABLE events ADD CONSTRAINT check_max_capacity CHECK (max_capacity > 0);
    END IF;
END $$;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Venues RLS policies
DROP POLICY IF EXISTS "Venues are viewable by authenticated users" ON venues;
CREATE POLICY "Venues are viewable by authenticated users" ON venues
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert venues" ON venues;
CREATE POLICY "Users can insert venues" ON venues
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update venues" ON venues;
CREATE POLICY "Users can update venues" ON venues
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete venues" ON venues;
CREATE POLICY "Users can delete venues" ON venues
    FOR DELETE USING (auth.role() = 'authenticated');

-- Events RLS policies
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON events;
CREATE POLICY "Events are viewable by authenticated users" ON events
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert events" ON events;
CREATE POLICY "Users can insert events" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update events" ON events;
CREATE POLICY "Users can update events" ON events
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete events" ON events;
CREATE POLICY "Users can delete events" ON events
    FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- VERIFICATION
-- ========================================

-- Show final schema for both tables
SELECT 'VENUES TABLE FINAL SCHEMA' as table_name, '' as info
UNION ALL
SELECT 
    column_name, 
    data_type || ' | ' || 
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END || ' | ' || 
    COALESCE(column_default, 'No Default')
FROM information_schema.columns 
WHERE table_name = 'venues';

SELECT '' as table_name, '' as info
UNION ALL
SELECT 'EVENTS TABLE FINAL SCHEMA' as table_name, '' as info
UNION ALL
SELECT 
    column_name, 
    data_type || ' | ' || 
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END || ' | ' || 
    COALESCE(column_default, 'No Default')
FROM information_schema.columns 
WHERE table_name = 'events'; 