-- Basic Database Migration Script
-- This script adds all missing fields without constraints or policies

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
-- VERIFICATION
-- =====================================================

-- Count total columns in events table
SELECT 
    'events' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'events';

-- Count total columns in exhibitors table
SELECT 
    'exhibitors' as table_name,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'exhibitors';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Basic schema migration completed successfully!' as status; 