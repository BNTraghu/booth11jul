-- Simplified Database Migration Script
-- This script adds all missing fields without RLS policies

-- =====================================================
-- EVENTS TABLE MIGRATION
-- =====================================================

-- Add extended fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS address_landmark text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS address_standard text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS area_sq_ft integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS kind_of_space text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_covered boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS pricing_per_day numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS facility_area_sq_ft integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS no_of_stalls integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS facility_covered boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS amenities text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS no_of_flats integer;

-- Add Google Maps fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS formatted_address text;

-- Add constraints for events table (drop existing first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_area_sq_ft') THEN
        ALTER TABLE events ADD CONSTRAINT check_area_sq_ft CHECK (area_sq_ft > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_pricing_per_day') THEN
        ALTER TABLE events ADD CONSTRAINT check_pricing_per_day CHECK (pricing_per_day >= 0);
    END IF;
END $$;

-- =====================================================
-- EXHIBITORS TABLE MIGRATION
-- =====================================================

-- Add company information fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS company_description text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS established_year text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS company_size text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS website text;

-- Add contact information fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS alternate_email text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS alternate_phone text;

-- Add business details fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS sub_category text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS gst_number text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS pan_number text;

-- Add location fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS country text DEFAULT 'India';

-- Add exhibition details fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS booth_preference text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS booth_size text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS special_requirements text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS previous_exhibitions text;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS expected_visitors text;

-- Add products and services fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS products jsonb DEFAULT '[]';
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS services jsonb DEFAULT '[]';
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS target_audience text;

-- Add payment and billing fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS registration_fee numeric DEFAULT 15000;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'online';
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS billing_address text;

-- Add social media and documents fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS social_media_links jsonb DEFAULT '{}';
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '{}';

-- Add settings fields
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS send_confirmation_email boolean DEFAULT true;
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS allow_marketing_emails boolean DEFAULT false;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_address ON events(address_line1);

-- Exhibitors table indexes
CREATE INDEX IF NOT EXISTS idx_exhibitors_status ON exhibitors(status);
CREATE INDEX IF NOT EXISTS idx_exhibitors_category ON exhibitors(category);
CREATE INDEX IF NOT EXISTS idx_exhibitors_city ON exhibitors(city);
CREATE INDEX IF NOT EXISTS idx_exhibitors_payment_status ON exhibitors(payment_status);
CREATE INDEX IF NOT EXISTS idx_exhibitors_company_name ON exhibitors(company_name);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify events table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Verify exhibitors table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
ORDER BY ordinal_position;

-- =====================================================
-- MIGRATION COMPLETION MESSAGE
-- =====================================================

SELECT 'Schema migration completed successfully!' as status; 