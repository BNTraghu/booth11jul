-- Database Migration Script for Event Management System
-- This script adds all missing fields to events and exhibitors tables

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

-- Add constraints for events table
ALTER TABLE events ADD CONSTRAINT IF NOT EXISTS check_area_sq_ft CHECK (area_sq_ft > 0);
ALTER TABLE events ADD CONSTRAINT IF NOT EXISTS check_pricing_per_day CHECK (pricing_per_day >= 0);

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
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- Create policies for events table (drop existing first)
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON events;
CREATE POLICY "Events are viewable by authenticated users" ON events
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Events can be created by authenticated users" ON events;
CREATE POLICY "Events can be created by authenticated users" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Events can be updated by creator or admin" ON events;
CREATE POLICY "Events can be updated by creator or admin" ON events
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );

DROP POLICY IF EXISTS "Events can be deleted by creator or admin" ON events;
CREATE POLICY "Events can be deleted by creator or admin" ON events
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- Create policies for exhibitors table (drop existing first)
DROP POLICY IF EXISTS "Exhibitors are viewable by authenticated users" ON exhibitors;
CREATE POLICY "Exhibitors are viewable by authenticated users" ON exhibitors
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Exhibitors can be created by authenticated users" ON exhibitors;
CREATE POLICY "Exhibitors can be created by authenticated users" ON exhibitors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Exhibitors can be updated by admin" ON exhibitors;
CREATE POLICY "Exhibitors can be updated by admin" ON exhibitors
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin', 'sales_marketing')
        )
    );

DROP POLICY IF EXISTS "Exhibitors can be deleted by admin" ON exhibitors;
CREATE POLICY "Exhibitors can be deleted by admin" ON exhibitors
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );

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
-- SAMPLE DATA INSERTION (Optional)
-- =====================================================

-- Insert sample venue for testing
INSERT INTO venues (id, name, location, capacity, status) 
VALUES (
    gen_random_uuid(),
    'Test Community Hall',
    'Mumbai, Maharashtra',
    500,
    'active'
) ON CONFLICT DO NOTHING;

-- Insert sample user for testing
INSERT INTO users (id, email, name, role, status) 
VALUES (
    gen_random_uuid(),
    'test@example.com',
    'Test User',
    'admin',
    'active'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETION MESSAGE
-- =====================================================

-- This will show in the query results
SELECT 'Migration completed successfully!' as status; 