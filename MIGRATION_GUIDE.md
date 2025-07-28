# Database Migration Guide

## 🚨 Schema Validation Failed - Missing Required Fields

Your database tables are missing the required fields for the CreateEvent and CreateExhibitor components. Follow this guide to fix the issue.

## 📋 Prerequisites

1. **Supabase Access**: You need access to your Supabase project dashboard
2. **SQL Editor**: Use Supabase's built-in SQL editor or any PostgreSQL client
3. **Backup**: Consider backing up your data before running migrations

## 🔧 Step-by-Step Migration

### Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Migration Script

1. **Copy the migration script** from `database_migration.sql`
2. **Paste it into the SQL Editor** in Supabase
3. **Click "Run"** to execute the migration

### Step 3: Verify the Migration

After running the migration, you should see:
- `Migration completed successfully!` message
- Two result sets showing the table structures

### Step 4: Test the Integration

1. **Refresh your application**
2. **Navigate to the SupabaseConnectionStatus component**
3. **Click "Run Tests"** to verify the schema

## 📊 Expected Results

### Events Table - New Fields Added:
```
✅ address_line1 (text)
✅ address_landmark (text)
✅ address_standard (text)
✅ area_sq_ft (integer)
✅ kind_of_space (text)
✅ is_covered (boolean)
✅ pricing_per_day (numeric)
✅ facility_area_sq_ft (integer)
✅ no_of_stalls (integer)
✅ facility_covered (boolean)
✅ amenities (text)
✅ no_of_flats (integer)
✅ latitude (numeric)
✅ longitude (numeric)
✅ formatted_address (text)
```

### Exhibitors Table - New Fields Added:
```
✅ company_description (text)
✅ established_year (text)
✅ company_size (text)
✅ website (text)
✅ designation (text)
✅ alternate_email (text)
✅ alternate_phone (text)
✅ sub_category (text)
✅ business_type (text)
✅ gst_number (text)
✅ pan_number (text)
✅ address (text)
✅ state (text)
✅ pincode (text)
✅ country (text)
✅ booth_preference (text)
✅ booth_size (text)
✅ special_requirements (text)
✅ previous_exhibitions (text)
✅ expected_visitors (text)
✅ products (jsonb)
✅ services (jsonb)
✅ target_audience (text)
✅ registration_fee (numeric)
✅ payment_method (text)
✅ billing_address (text)
✅ social_media_links (jsonb)
✅ documents (jsonb)
✅ send_confirmation_email (boolean)
✅ allow_marketing_emails (boolean)
```

## 🔍 Troubleshooting

### If Migration Fails:

1. **Check Permissions**: Ensure you have admin access to the database
2. **Check Table Names**: Verify table names match exactly (`events`, `exhibitors`)
3. **Check Existing Columns**: The script uses `IF NOT EXISTS` so it won't fail if columns already exist

### Common Issues:

#### Issue: "Table does not exist"
**Solution**: Create the base tables first:
```sql
-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    event_time time NOT NULL,
    venue_id uuid,
    venue_name text,
    city text NOT NULL,
    max_capacity integer NOT NULL,
    plan_type text,
    status text NOT NULL DEFAULT 'draft',
    attendees integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    created_by uuid,
    vendor_ids jsonb DEFAULT '[]',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create exhibitors table if it doesn't exist
CREATE TABLE IF NOT EXISTS exhibitors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    category text,
    city text,
    booth text,
    registration_date timestamp with time zone DEFAULT now(),
    status text NOT NULL DEFAULT 'registered',
    payment_status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

#### Issue: "Permission denied"
**Solution**: Check your Supabase RLS policies or run as a service role

## ✅ Verification Commands

After migration, run these queries to verify:

### Check Events Table Structure:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;
```

### Check Exhibitors Table Structure:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exhibitors' 
ORDER BY ordinal_position;
```

### Test Insert (Optional):
```sql
-- Test events table
INSERT INTO events (title, event_date, event_time, city, max_capacity, address_line1, area_sq_ft, kind_of_space)
VALUES ('Test Event', '2024-12-31', '18:00', 'Mumbai', 100, '123 Test St', 1000, 'Community Hall')
RETURNING id;

-- Test exhibitors table
INSERT INTO exhibitors (company_name, email, phone, category, city, company_description, business_type)
VALUES ('Test Company', 'test@company.com', '+91-9876543210', 'Technology', 'Mumbai', 'Test description', 'Private Limited')
RETURNING id;
```

## 🎯 Success Indicators

After successful migration:

1. **SupabaseConnectionStatus** shows:
   - ✅ Events Table Schema: PASS
   - ✅ Exhibitors Table Schema: PASS

2. **CreateEvent component** can:
   - Save events with Google Maps coordinates
   - Store extended venue details
   - Validate all required fields

3. **CreateExhibitor component** can:
   - Complete multi-step registration
   - Store all business details
   - Handle document uploads

## 🚀 Next Steps

1. **Test the components** thoroughly
2. **Add sample data** if needed
3. **Configure RLS policies** for production
4. **Set up monitoring** for database performance

## 📞 Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your environment variables
3. Test with the provided verification queries
4. Review the `DATABASE_SCHEMA.md` documentation

---

**Migration Status**: Ready to execute
**Estimated Time**: 2-5 minutes
**Risk Level**: Low (uses `IF NOT EXISTS` clauses) 