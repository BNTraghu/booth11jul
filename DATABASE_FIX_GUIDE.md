# Database Schema Fix Guide

## Issue
The error "Could not find the 'amenities' column of 'venues' in the schema cache" indicates that the `amenities` column is missing from your venues table in Supabase.

## Solution Steps

### Step 1: Check Current Schema
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run the `check_schema.sql` script to see what columns currently exist

### Step 2: Run the Comprehensive Migration
1. In the **SQL Editor**, run the `comprehensive_migration.sql` script
2. This will add all missing columns including:
   - `amenities` column to venues table
   - `event_end_date` and `event_end_time` to events table
   - `event_image_url` to events table
   - All extended venue fields

### Step 3: Verify the Migration
1. Run the verification queries in `comprehensive_migration.sql` again
2. Ensure all columns are now present

## Files Created

### 1. `check_schema.sql`
- **Purpose**: Check current database schema
- **Use**: Run first to see what's missing

### 2. `comprehensive_migration.sql`
- **Purpose**: Add all missing columns
- **Use**: Run to fix the database schema

## What This Fixes

### Venues Table
- ✅ Adds `amenities` column (text array)
- ✅ Adds extended address fields
- ✅ Adds facility and space details
- ✅ Adds pricing and availability fields
- ✅ Adds Google Maps coordinates
- ✅ Adds description field

### Events Table
- ✅ Adds `event_end_date` (date)
- ✅ Adds `event_end_time` (time)
- ✅ Adds `event_image_url` (text)

## After Running the Migration

1. **Test Venue Creation**: Try creating a venue with facilities and amenities
2. **Test Venue Editing**: Try editing an existing venue
3. **Test Event Creation**: Try creating an event with end date/time
4. **Test Event Editing**: Try editing an existing event

## Troubleshooting

### If you still get errors:
1. **Refresh Schema Cache**: In Supabase Dashboard, go to Settings > Database and refresh the schema cache
2. **Check RLS Policies**: Ensure Row Level Security policies are properly configured
3. **Verify Column Types**: Make sure the column data types match what the application expects

### Common Issues:
- **Column already exists**: The `IF NOT EXISTS` clause will prevent errors
- **Permission denied**: Ensure you have the right permissions in Supabase
- **RLS blocking**: Check if Row Level Security is blocking the operations

## Expected Result

After running the migration, you should be able to:
- ✅ Create venues with facilities and amenities
- ✅ Edit venues and update amenities
- ✅ Create events with start and end dates/times
- ✅ Edit events and update all fields
- ✅ Upload and display event images

## Next Steps

1. Run the migration scripts
2. Test the functionality
3. If everything works, you can delete the old migration files:
   - `venue_migration.sql` (replaced by comprehensive_migration.sql)
   - `event_end_date_migration.sql` (replaced by comprehensive_migration.sql) 