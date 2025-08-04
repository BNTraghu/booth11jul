-- Test Exhibitor Update Functionality
-- This script checks if all required fields exist and tests a basic update

-- 1. Check if all required fields exist in the exhibitor table
SELECT 
    'Checking Required Fields' as test,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
AND column_name IN (
    'company_name', 'company_description', 'established_year', 'company_size', 'website',
    'contact_person', 'designation', 'email', 'phone', 'alternate_phone', 'alternate_email',
    'category', 'sub_category', 'business_type', 'gst_number', 'pan_number',
    'address', 'city', 'state', 'pincode', 'country',
    'booth_preference', 'booth_size', 'special_requirements', 'previous_exhibitions', 'expected_visitors',
    'products', 'services', 'target_audience',
    'registration_fee', 'payment_method', 'billing_address',
    'social_media_links',
    'status', 'payment_status', 'send_confirmation_email', 'allow_marketing_emails'
)
ORDER BY column_name;

-- 2. Check if there are any exhibitors in the table
SELECT 
    'Exhibitor Count' as test,
    COUNT(*) as total_exhibitors
FROM exhibitors;

-- 3. Show sample exhibitor data (first 3 records)
SELECT 
    'Sample Exhibitor Data' as test,
    id,
    company_name,
    contact_person,
    email,
    category,
    city,
    status,
    payment_status
FROM exhibitors 
LIMIT 3;

-- 4. Test a simple update operation (if there are exhibitors)
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Get the first exhibitor ID
    SELECT id INTO test_id FROM exhibitors LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        -- Test update with minimal fields
        UPDATE exhibitors 
        SET 
            company_name = COALESCE(company_name, 'Test Company'),
            contact_person = COALESCE(contact_person, 'Test Contact'),
            email = COALESCE(email, 'test@example.com'),
            updated_at = NOW()
        WHERE id = test_id;
        
        RAISE NOTICE 'Test update completed for exhibitor ID: %', test_id;
    ELSE
        RAISE NOTICE 'No exhibitors found to test update';
    END IF;
END $$;

-- 5. Check RLS policies
SELECT 
    'RLS Policies' as test,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'exhibitors'; 