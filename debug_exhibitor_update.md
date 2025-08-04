# Debugging Exhibitor Update Issue

## Step 1: Check Browser Console

1. **Open Browser Developer Tools:**
   - Press `F12` or right-click → "Inspect"
   - Go to **Console** tab

2. **Try to Update an Exhibitor:**
   - Go to Exhibitors page
   - Click "Edit" on any exhibitor
   - Make some changes
   - Click "Save Changes"

3. **Look for Console Logs:**
   ```
   Starting exhibitor update with data: {...}
   Update data being sent: {...}
   Updating exhibitor ID: ...
   ```

4. **Check for Errors:**
   - Any red error messages
   - Network tab for failed requests
   - Supabase error details

## Step 2: Check Database State

Run this in Supabase SQL Editor:

```sql
-- Check if exhibitor table exists and has data
SELECT 
    'Table Check' as info,
    COUNT(*) as total_exhibitors
FROM exhibitors;

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
ORDER BY ordinal_position;

-- Check sample data
SELECT 
    id,
    company_name,
    contact_person,
    email,
    category,
    status
FROM exhibitors 
LIMIT 3;
```

## Step 3: Test Basic Update

Run this to test if updates work at all:

```sql
-- Test basic update
UPDATE exhibitors 
SET 
    company_name = 'Test Update ' || NOW(),
    updated_at = NOW()
WHERE id = (SELECT id FROM exhibitors LIMIT 1);

-- Check if update worked
SELECT 
    id,
    company_name,
    updated_at
FROM exhibitors 
ORDER BY updated_at DESC 
LIMIT 1;
```

## Step 4: Check RLS Policies

```sql
-- Check RLS policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'exhibitors';
```

## Step 5: Common Issues & Solutions

### Issue 1: "Column not found"
**Solution:** Run the migration script
```sql
-- Copy and paste exhibitor_database_migration.sql
```

### Issue 2: "Permission denied"
**Solution:** Check authentication
- Make sure you're logged in
- Check RLS policies allow updates

### Issue 3: "Data not updating"
**Solution:** Check field mappings
- Verify field names match exactly
- Check data types

### Issue 4: "Form not showing data"
**Solution:** Check handleEdit function
- Verify data mapping
- Check for null/undefined values

## Step 6: Manual Test

Try this manual update in SQL Editor:

```sql
-- Get an exhibitor ID
SELECT id, company_name FROM exhibitors LIMIT 1;

-- Update with all fields (replace UUID with actual ID)
UPDATE exhibitors 
SET 
    company_name = 'Updated Company Name',
    company_description = 'Updated description',
    contact_person = 'Updated Contact',
    email = 'updated@example.com',
    phone = '1234567890',
    category = 'Technology',
    sub_category = 'Software',
    city = 'Mumbai',
    status = 'confirmed',
    payment_status = 'paid',
    updated_at = NOW()
WHERE id = 'YOUR_EXHIBITOR_ID_HERE';

-- Verify update
SELECT * FROM exhibitors WHERE id = 'YOUR_EXHIBITOR_ID_HERE';
```

## Step 7: Check Frontend Code

1. **Verify handleEdit function** maps data correctly
2. **Check handleSaveEdit function** sends correct data
3. **Ensure form fields** are properly bound
4. **Check for TypeScript errors** in console

## Step 8: Report Results

Please provide:
1. **Console logs** from browser
2. **Database check results** from Step 2
3. **Any error messages** you see
4. **What exactly happens** when you try to update

This will help identify the exact issue! 