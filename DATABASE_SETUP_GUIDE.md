# Database Setup Guide for Enhanced Exhibitor Management

## Overview
This guide will help you set up the Supabase database to support all the new exhibitor fields we've added to the application.

## Files Created
1. `check_exhibitor_database.sql` - Diagnostic script to check current database state
2. `exhibitor_database_migration.sql` - Migration script to add all missing fields
3. `DATABASE_SETUP_GUIDE.md` - This guide

## Step-by-Step Setup

### Step 1: Check Current Database State
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `check_exhibitor_database.sql`
4. Click **Run** to see the current state of your exhibitor table

This will show you:
- Current table structure
- Expected fields from our TypeScript interface
- Missing fields that need to be added
- RLS policies status

### Step 2: Run the Migration Script
1. In the same SQL Editor
2. Copy and paste the contents of `exhibitor_database_migration.sql`
3. Click **Run** to add all missing fields

This script will:
- Create the exhibitor table if it doesn't exist
- Add all missing fields with proper data types
- Set up constraints and indexes
- Enable Row Level Security (RLS)
- Create RLS policies
- Set up triggers for `updated_at` field

### Step 3: Verify the Migration
After running the migration, run the check script again to verify all fields were added successfully.

## Fields Being Added

### Company Information
- `company_name` (TEXT)
- `company_description` (TEXT)
- `established_year` (TEXT)
- `company_size` (TEXT)
- `website` (TEXT)

### Contact Information
- `contact_person` (TEXT)
- `designation` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `alternate_phone` (TEXT)
- `alternate_email` (TEXT)

### Business Details
- `category` (TEXT)
- `sub_category` (TEXT)
- `business_type` (TEXT)
- `gst_number` (TEXT)
- `pan_number` (TEXT)

### Location & Address
- `address` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `pincode` (TEXT)
- `country` (TEXT) - Default: 'India'

### Exhibition Details
- `booth_preference` (TEXT)
- `booth_size` (TEXT)
- `special_requirements` (TEXT)
- `previous_exhibitions` (TEXT)
- `expected_visitors` (TEXT)

### Products & Services
- `products` (TEXT[]) - Array of product names
- `services` (TEXT[]) - Array of service names
- `target_audience` (TEXT)

### Payment & Billing
- `registration_fee` (NUMERIC) - Default: 15000
- `payment_method` (TEXT)
- `billing_address` (TEXT)

### Additional Information
- `social_media_links` (JSONB) - Stores LinkedIn, Facebook, Twitter, Instagram URLs

### Settings
- `status` (TEXT) - Default: 'registered'
- `payment_status` (TEXT) - Default: 'pending'
- `send_confirmation_email` (BOOLEAN) - Default: true
- `allow_marketing_emails` (BOOLEAN) - Default: false

### Legacy Fields (for backward compatibility)
- `booth` (TEXT)
- `registration_date` (TIMESTAMP)

## Constraints Added
- Status check: Must be 'registered', 'confirmed', 'checked_in', or 'cancelled'
- Payment status check: Must be 'pending', 'paid', or 'refunded'
- Registration fee check: Must be >= 0

## Indexes Created
- `idx_exhibitors_company_name`
- `idx_exhibitors_category`
- `idx_exhibitors_sub_category`
- `idx_exhibitors_city`
- `idx_exhibitors_status`
- `idx_exhibitors_payment_status`
- `idx_exhibitors_created_at`

## RLS Policies
- Read access for all users
- Insert/Update/Delete for authenticated users only

## Troubleshooting

### If you get errors:
1. **Permission errors**: Make sure you're logged in as a database owner
2. **Column already exists**: The script uses `IF NOT EXISTS` so it's safe to run multiple times
3. **RLS policy errors**: The script drops and recreates policies

### If fields are still missing:
1. Check the error messages in the SQL Editor
2. Run the check script again to see what's missing
3. Manually add any missing fields using individual ALTER TABLE statements

## Testing the Setup

After running the migration:

1. **Test the Add Exhibitor form** - All fields should save properly
2. **Test the Edit Exhibitor form** - All fields should be editable
3. **Test the View Modal** - All fields should display correctly
4. **Test filtering** - Category and Sub-Category filters should work

## Next Steps

Once the database is set up:

1. Test adding a new exhibitor with all fields
2. Test editing an existing exhibitor
3. Test the view modal to see all data
4. Test filtering by category and sub-category

## Support

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify all SQL scripts ran successfully
3. Check that the TypeScript interfaces match the database schema

The migration script is designed to be safe and can be run multiple times without causing issues. 