-- Exhibitor Database Migration Script
-- This script adds all missing fields to the exhibitor table to match our TypeScript interface

-- 1. Create exhibitor table if it doesn't exist
CREATE TABLE IF NOT EXISTS exhibitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing Company Information fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'company_name') THEN
        ALTER TABLE exhibitors ADD COLUMN company_name TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'company_description') THEN
        ALTER TABLE exhibitors ADD COLUMN company_description TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'established_year') THEN
        ALTER TABLE exhibitors ADD COLUMN established_year TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'company_size') THEN
        ALTER TABLE exhibitors ADD COLUMN company_size TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'website') THEN
        ALTER TABLE exhibitors ADD COLUMN website TEXT;
    END IF;
END $$;

-- 3. Add missing Contact Information fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'contact_person') THEN
        ALTER TABLE exhibitors ADD COLUMN contact_person TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'designation') THEN
        ALTER TABLE exhibitors ADD COLUMN designation TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'email') THEN
        ALTER TABLE exhibitors ADD COLUMN email TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'phone') THEN
        ALTER TABLE exhibitors ADD COLUMN phone TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'alternate_phone') THEN
        ALTER TABLE exhibitors ADD COLUMN alternate_phone TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'alternate_email') THEN
        ALTER TABLE exhibitors ADD COLUMN alternate_email TEXT;
    END IF;
END $$;

-- 4. Add missing Business Details fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'category') THEN
        ALTER TABLE exhibitors ADD COLUMN category TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'sub_category') THEN
        ALTER TABLE exhibitors ADD COLUMN sub_category TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'business_type') THEN
        ALTER TABLE exhibitors ADD COLUMN business_type TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'gst_number') THEN
        ALTER TABLE exhibitors ADD COLUMN gst_number TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'pan_number') THEN
        ALTER TABLE exhibitors ADD COLUMN pan_number TEXT;
    END IF;
END $$;

-- 5. Add missing Location & Address fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'address') THEN
        ALTER TABLE exhibitors ADD COLUMN address TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'city') THEN
        ALTER TABLE exhibitors ADD COLUMN city TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'state') THEN
        ALTER TABLE exhibitors ADD COLUMN state TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'pincode') THEN
        ALTER TABLE exhibitors ADD COLUMN pincode TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'country') THEN
        ALTER TABLE exhibitors ADD COLUMN country TEXT DEFAULT 'India';
    END IF;
END $$;

-- 6. Add missing Exhibition Details fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'booth_preference') THEN
        ALTER TABLE exhibitors ADD COLUMN booth_preference TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'booth_size') THEN
        ALTER TABLE exhibitors ADD COLUMN booth_size TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'special_requirements') THEN
        ALTER TABLE exhibitors ADD COLUMN special_requirements TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'previous_exhibitions') THEN
        ALTER TABLE exhibitors ADD COLUMN previous_exhibitions TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'expected_visitors') THEN
        ALTER TABLE exhibitors ADD COLUMN expected_visitors TEXT;
    END IF;
END $$;

-- 7. Add missing Products & Services fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'products') THEN
        ALTER TABLE exhibitors ADD COLUMN products TEXT[];
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'services') THEN
        ALTER TABLE exhibitors ADD COLUMN services TEXT[];
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'target_audience') THEN
        ALTER TABLE exhibitors ADD COLUMN target_audience TEXT;
    END IF;
END $$;

-- 8. Add missing Payment & Billing fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'registration_fee') THEN
        ALTER TABLE exhibitors ADD COLUMN registration_fee NUMERIC DEFAULT 15000;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'payment_method') THEN
        ALTER TABLE exhibitors ADD COLUMN payment_method TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'billing_address') THEN
        ALTER TABLE exhibitors ADD COLUMN billing_address TEXT;
    END IF;
END $$;

-- 9. Add missing Additional Information fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'social_media_links') THEN
        ALTER TABLE exhibitors ADD COLUMN social_media_links JSONB;
    END IF;
END $$;

-- 10. Add missing Settings fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'status') THEN
        ALTER TABLE exhibitors ADD COLUMN status TEXT DEFAULT 'registered';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'payment_status') THEN
        ALTER TABLE exhibitors ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'send_confirmation_email') THEN
        ALTER TABLE exhibitors ADD COLUMN send_confirmation_email BOOLEAN DEFAULT true;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'allow_marketing_emails') THEN
        ALTER TABLE exhibitors ADD COLUMN allow_marketing_emails BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 11. Add missing Legacy fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'booth') THEN
        ALTER TABLE exhibitors ADD COLUMN booth TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitors' AND column_name = 'registration_date') THEN
        ALTER TABLE exhibitors ADD COLUMN registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 12. Add constraints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'exhibitors_status_check') THEN
        ALTER TABLE exhibitors ADD CONSTRAINT exhibitors_status_check 
        CHECK (status IN ('registered', 'confirmed', 'checked_in', 'cancelled'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'exhibitors_payment_status_check') THEN
        ALTER TABLE exhibitors ADD CONSTRAINT exhibitors_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'refunded'));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'exhibitors_registration_fee_check') THEN
        ALTER TABLE exhibitors ADD CONSTRAINT exhibitors_registration_fee_check 
        CHECK (registration_fee >= 0);
    END IF;
END $$;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exhibitors_company_name ON exhibitors(company_name);
CREATE INDEX IF NOT EXISTS idx_exhibitors_category ON exhibitors(category);
CREATE INDEX IF NOT EXISTS idx_exhibitors_sub_category ON exhibitors(sub_category);
CREATE INDEX IF NOT EXISTS idx_exhibitors_city ON exhibitors(city);
CREATE INDEX IF NOT EXISTS idx_exhibitors_status ON exhibitors(status);
CREATE INDEX IF NOT EXISTS idx_exhibitors_payment_status ON exhibitors(payment_status);
CREATE INDEX IF NOT EXISTS idx_exhibitors_created_at ON exhibitors(created_at);

-- 14. Enable Row Level Security (RLS)
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- 15. Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON exhibitors;
CREATE POLICY "Enable read access for all users" ON exhibitors
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON exhibitors;
CREATE POLICY "Enable insert for authenticated users only" ON exhibitors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON exhibitors;
CREATE POLICY "Enable update for authenticated users only" ON exhibitors
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON exhibitors;
CREATE POLICY "Enable delete for authenticated users only" ON exhibitors
    FOR DELETE USING (auth.role() = 'authenticated');

-- 16. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_exhibitors_updated_at ON exhibitors;
CREATE TRIGGER update_exhibitors_updated_at
    BEFORE UPDATE ON exhibitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 17. Verify the migration
SELECT 
    'Migration Complete' as status,
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name IN (
        'company_name', 'company_description', 'established_year', 'company_size', 'website',
        'contact_person', 'designation', 'email', 'phone', 'alternate_phone', 'alternate_email',
        'category', 'sub_category', 'business_type', 'gst_number', 'pan_number',
        'address', 'city', 'state', 'pincode', 'country',
        'booth_preference', 'booth_size', 'special_requirements', 'previous_exhibitions', 'expected_visitors',
        'products', 'services', 'target_audience',
        'registration_fee', 'payment_method', 'billing_address',
        'social_media_links',
        'status', 'payment_status', 'send_confirmation_email', 'allow_marketing_emails',
        'booth', 'registration_date'
    ) THEN 1 END) as expected_columns_found
FROM information_schema.columns 
WHERE table_name = 'exhibitors'; 