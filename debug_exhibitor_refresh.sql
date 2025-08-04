-- Debug Exhibitor Update and Refresh Issue
-- This script helps identify why updates aren't persisting

-- 1. Check current exhibitor data
SELECT 
    'Current Exhibitor Data' as info,
    id,
    company_name,
    contact_person,
    email,
    category,
    city,
    status,
    payment_status,
    updated_at,
    created_at
FROM exhibitors 
ORDER BY updated_at DESC 
LIMIT 5;

-- 2. Check if the table has the correct structure
SELECT 
    'Table Structure Check' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
AND column_name IN (
    'company_name', 'contact_person', 'email', 'category', 'city', 
    'status', 'payment_status', 'updated_at', 'created_at'
)
ORDER BY column_name;

-- 3. Test a manual update to see if it works
DO $$
DECLARE
    test_id UUID;
    old_name TEXT;
    new_name TEXT;
BEGIN
    -- Get the first exhibitor
    SELECT id, company_name INTO test_id, old_name FROM exhibitors LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        new_name := 'MANUAL TEST UPDATE ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS');
        
        -- Perform the update
        UPDATE exhibitors 
        SET 
            company_name = new_name,
            updated_at = NOW()
        WHERE id = test_id;
        
        -- Check if update worked
        IF FOUND THEN
            RAISE NOTICE 'Manual update SUCCESSFUL for ID: %, Old: %, New: %', test_id, old_name, new_name;
        ELSE
            RAISE NOTICE 'Manual update FAILED - no rows affected for ID: %', test_id;
        END IF;
    ELSE
        RAISE NOTICE 'No exhibitors found to test';
    END IF;
END $$;

-- 4. Check the result of the manual update
SELECT 
    'After Manual Update' as info,
    id,
    company_name,
    updated_at
FROM exhibitors 
ORDER BY updated_at DESC 
LIMIT 3;

-- 5. Check RLS policies that might be blocking updates
SELECT 
    'RLS Policies' as info,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'exhibitors';

-- 6. Check if there are any triggers that might be interfering
SELECT 
    'Triggers' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'exhibitors';

-- 7. Test insert to see if the table is writable
DO $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO exhibitors (
        company_name, 
        contact_person, 
        email, 
        category, 
        city, 
        status, 
        payment_status
    ) VALUES (
        'TEST INSERT ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
        'Test Contact',
        'test@example.com',
        'Technology',
        'Mumbai',
        'registered',
        'pending'
    ) RETURNING id INTO new_id;
    
    IF new_id IS NOT NULL THEN
        RAISE NOTICE 'Test insert SUCCESSFUL, new ID: %', new_id;
        
        -- Clean up the test record
        DELETE FROM exhibitors WHERE id = new_id;
        RAISE NOTICE 'Test record cleaned up';
    ELSE
        RAISE NOTICE 'Test insert FAILED';
    END IF;
END $$; 