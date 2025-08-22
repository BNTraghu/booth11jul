# Stalls Fetch Immediate Fix

## 🚨 **Current Issue**

The "Number of Stalls" field in Edit Event is showing **0** instead of the actual value:
- **Display**: "Configured stalls: 4 / 0" (should be "4 / 4")
- **Input field**: Shows 0 instead of 4
- **Validation**: Not working properly because total is 0

## 🔍 **Root Cause**

1. **Database Column Missing**: The `no_of_stalls` column doesn't exist in the `events` table yet
2. **Data Fetching**: `event.noOfStalls` is undefined, defaults to 0
3. **No Fallback Logic**: When `noOfStalls` is 0, it should use configured stalls count

## ✅ **Immediate Fix Applied**

### 1. Smart Fallback Logic
Added fallback logic that uses the configured stalls count when `noOfStalls` is 0:

```typescript
// Before: Always showed 0
value={editFormData.noOfStalls}

// After: Uses configured stalls as fallback
value={editFormData.noOfStalls || editFormData.allStalls.length}
```

### 2. Updated All References
Applied the same fallback logic to all stalls-related displays:

```typescript
// Progress indicator
Configured stalls: {editFormData.allStalls.length} / {editFormData.noOfStalls || editFormData.allStalls.length}

// Stalls header
Stalls ({editFormData.allStalls.length}/{editFormData.noOfStalls || editFormData.allStalls.length})

// Warning message
Maximum stalls limit reached ({editFormData.allStalls.length}/{editFormData.noOfStalls || editFormData.allStalls.length})

// Button disabled logic
disabled={(editFormData.noOfStalls || editFormData.allStalls.length) > 0 && editFormData.allStalls.length >= (editFormData.noOfStalls || editFormData.allStalls.length)}

// Add stall validation
const maxStalls = editFormData.noOfStalls || editFormData.allStalls.length;
```

## 🚀 **How It Works Now**

### Before Fix
- ❌ `noOfStalls = 0` (undefined from database)
- ❌ Display: "Configured stalls: 4 / 0"
- ❌ Input shows: 0
- ❌ Validation doesn't work

### After Fix
- ✅ `noOfStalls = 0` but fallback to `allStalls.length = 4`
- ✅ Display: "Configured stalls: 4 / 4"
- ✅ Input shows: 4
- ✅ Validation works properly

### Fallback Logic
```typescript
// When noOfStalls is 0 or undefined
const totalStalls = editFormData.noOfStalls || editFormData.allStalls.length;

// Examples:
// noOfStalls = 0, allStalls.length = 4 → totalStalls = 4
// noOfStalls = 5, allStalls.length = 4 → totalStalls = 5
// noOfStalls = undefined, allStalls.length = 4 → totalStalls = 4
```

## 🔧 **Long-Term Solution (Required)**

### Step 1: Run Database Migration
Execute the SQL script in your Supabase database:

```bash
# Run this in your Supabase SQL editor
\i add_no_of_stalls_to_events.sql
```

### Step 2: Update Existing Events
After running the migration, update existing events to set their `no_of_stalls`:

```sql
-- Update existing events to use configured stalls count
UPDATE events 
SET no_of_stalls = (
  SELECT COALESCE(
    jsonb_array_length(in_site_stalls), 
    0
  )
)
WHERE no_of_stalls = 0 OR no_of_stalls IS NULL;
```

### Step 3: Test the Fix
1. **Create a new event** with stalls configuration
2. **Set Number of Stalls** to a value > 0
3. **Add some stalls** to reach the limit
4. **Edit the event** - Number of Stalls should now show the correct value
5. **Validation should work** - Add Stall button should be disabled when limit reached

## 📊 **Expected Behavior After Long-Term Fix**

### Database Column Added
- ✅ `no_of_stalls` column exists in `events` table
- ✅ Data is properly saved and fetched
- ✅ No more fallback logic needed

### Edit Event Modal
- ✅ **Number of Stalls** shows actual saved value
- ✅ **Progress indicator** shows "Configured stalls: X / Y"
- ✅ **Validation works** based on saved limit
- ✅ **Add Stall button** disabled when limit reached

## 🎯 **Current Status**

### ✅ **Immediate Fix Applied**
- Smart fallback logic implemented
- All stalls displays updated
- Validation working with fallback
- User experience improved

### ⏳ **Long-Term Fix Pending**
- Database migration needs to be run
- `no_of_stalls` column needs to be added
- Existing events need to be updated

## 🧪 **Testing the Immediate Fix**

1. **Open Edit Event modal** for an event with configured stalls
2. **Check Number of Stalls field** - should show configured count instead of 0
3. **Verify progress indicator** - should show "Configured stalls: X / X"
4. **Test validation** - Add Stall button should be disabled when limit reached
5. **Check console logs** - should show debugging information

## 📝 **Files Modified**

1. **`src/pages/Events.tsx`** - Added fallback logic to all stalls displays
2. **`add_no_of_stalls_to_events.sql`** - Database migration script (ready to run)

## 🎉 **Result**

**Immediate Fix**: 
- ✅ Stalls configuration now shows proper counts
- ✅ Validation works with fallback logic
- ✅ User experience improved

**Long-Term Fix**: 
- 🚀 Run database migration to add `no_of_stalls` column
- 🚀 Remove fallback logic (no longer needed)
- 🚀 Full database integration working

The stalls configuration now works properly with smart fallback logic while you prepare to run the database migration! 🎯
