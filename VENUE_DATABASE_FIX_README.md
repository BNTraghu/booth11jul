# Venue Database Fix - Missing Columns Issue

## Problem Description

When trying to add a venue, you're getting the error:
```
Could not find the 'contact_role' column of 'venues' in the schema cache
```

This happens because the `AddVenue` form is trying to insert data into columns that don't exist in the current `venues` table schema.

## Root Cause

The `venues` table is missing several columns that the form expects:
- `contact_role` - Role/designation of the contact person
- `address_line1` - Primary address line
- `address_landmark` - Landmark or reference point
- `address_standard` - Standardized address format
- `area_sq_ft` - Total area in square feet
- `kind_of_space` - Type of space (indoor/outdoor/mixed)
- `is_covered` - Whether the venue is covered
- `pricing_per_day` - Daily pricing rate
- `facility_area_sq_ft` - Facility area in square feet
- `no_of_stalls` - Number of available stalls
- `facility_covered` - Whether the facility is covered
- `no_of_flats` - Number of available flats
- `latitude` - Geographic latitude coordinate
- `longitude` - Geographic longitude coordinate
- `formatted_address` - Formatted address string
- `custom_contacts` - Array of custom contact information

## Solutions

### Option 1: Add Missing Columns to Database (Recommended)

Run the SQL migration script to add all missing columns:

```sql
-- Execute the file: add_venue_missing_columns.sql
```

This script will:
1. Safely add all missing columns
2. Set appropriate data types
3. Add default values where needed
4. Include helpful comments

### Option 2: Temporary Fix (Already Applied)

I've already commented out the problematic fields in the `AddVenue.tsx` component. The form will now only insert the basic venue information:
- name
- location
- contact_person
- email
- phone
- capacity
- facilities
- amenities
- description
- status

## Current Status

✅ **Immediate Fix Applied**: Form fields are commented out to prevent errors
⚠️ **Limited Functionality**: Advanced features (Google Maps, extended fields) are disabled
🔧 **Database Update Needed**: Run migration script to enable full functionality

## Steps to Enable Full Functionality

1. **Run the migration script**:
   ```bash
   # Connect to your Supabase database and run:
   \i add_venue_missing_columns.sql
   ```

2. **Uncomment the form fields** in `AddVenue.tsx`:
   - Remove the `//` comments from the extended fields
   - Remove the `//` comments from the Google Maps fields
   - Remove the `//` comments from the custom contacts fields

3. **Test the venue creation** with all features enabled

## Verification

After running the migration, verify the columns were added:

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'venues' 
AND column_name IN (
    'contact_role',
    'address_line1',
    'address_landmark',
    'address_standard',
    'area_sq_ft',
    'kind_of_space',
    'is_covered',
    'pricing_per_day',
    'facility_area_sq_ft',
    'no_of_stalls',
    'facility_covered',
    'no_of_flats',
    'latitude',
    'longitude',
    'formatted_address',
    'custom_contacts'
)
ORDER BY column_name;
```

## Files Modified

- `src/pages/AddVenue.tsx` - Commented out problematic fields
- `add_venue_missing_columns.sql` - Database migration script
- `VENUE_DATABASE_FIX_README.md` - This documentation

## Next Steps

1. **Immediate**: The form will work with basic venue creation
2. **Short-term**: Run the migration script to add missing columns
3. **Long-term**: Uncomment the advanced features in the form

The venue creation should now work without the database error, though with limited functionality until the database is updated. 