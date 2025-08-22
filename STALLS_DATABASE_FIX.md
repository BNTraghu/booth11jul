# Stalls Database Configuration Fix

## Problem
You were getting a "malformed array literal" error when creating events with stalls because the CreateEvent component was trying to store JSON data in the wrong database field.

## Root Cause
The CreateEvent.tsx was using:
```javascript
all_stalls: JSON.stringify(formData.allStalls)
```

But `all_stalls` is a `character varying[]` (string array) field, not JSONB, so storing JSON strings caused the error.

## Solution

### ✅ **Database Schema (Already Correct)**
Your events table already has the correct fields:
- `in_site_stalls jsonb` - For storing detailed stall configuration objects
- `out_site_stalls jsonb` - For future out-site stalls 
- `all_stalls character varying[]` - For storing simple stall number arrays

### ✅ **Updated CreateEvent.tsx**
Fixed the form submission to use proper fields:
```javascript
// Stalls Configuration
in_site_stalls: formData.allStalls, // Store as JSONB array
all_stalls: formData.allStalls.map(stall => stall.stallNo) // Store stall numbers as string array
```

### ✅ **Updated TypeScript Types**
Updated Supabase types (`src/lib/supabase.ts`) and Event interface (`src/types/index.ts`) to include:
- `in_site_stalls: any[] | null`
- `out_site_stalls: any[] | null` 
- `all_stalls: string[] | null`
- All other event fields from your database schema

## Data Structure
Your stalls will now be stored correctly as:

**in_site_stalls (JSONB):**
```json
[
  {
    "id": "1755592792034",
    "stallNo": "A1",
    "stallSize": "Medium (8x8 ft)",
    "stallCategory": "Fashion & Accessories", 
    "price": 5000
  }
]
```

**all_stalls (string array):**
```json
["A1", "A2", "A3", "A4", "A5"]
```

## Result
✅ No more "malformed array literal" errors
✅ Stalls data stored correctly in proper JSONB and string array fields
✅ Full TypeScript support with proper types
✅ Ready for querying and displaying stall information
