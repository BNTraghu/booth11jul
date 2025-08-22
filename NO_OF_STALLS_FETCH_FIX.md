# Number of Stalls Fetch Fix

## 🚨 **Issue Identified**

The "Number of Stalls" field in the Edit Event modal was showing **0** instead of the actual value because:

1. **Missing Database Column**: The `no_of_stalls` column doesn't exist in the `events` table
2. **Data Not Being Saved**: Both CreateEvent and Edit Event were not saving the `noOfStalls` value to the database
3. **Default Value**: When `event.noOfStalls` is undefined, it defaults to 0

## 🔍 **Root Cause Analysis**

### Database Schema Issue
- **Current Schema**: `no_of_stalls` column is marked as ❌ (doesn't exist) in DATABASE_SCHEMA.md
- **Required Column**: This column is needed for stalls validation to work properly
- **Migration Missing**: The column was never added to the database

### Code Issues
1. **CreateEvent.tsx**: Not saving `formData.noOfStalls` to database
2. **Events.tsx**: Not saving `editFormData.noOfStalls` to database  
3. **useEvents Hook**: Mapping from non-existent `event.no_of_stalls` field

## ✅ **Solution Implemented**

### 1. Database Migration
Created `add_no_of_stalls_to_events.sql` to add the missing column:

```sql
-- Add missing no_of_stalls column to events table
ALTER TABLE events ADD COLUMN no_of_stalls integer DEFAULT 0;
COMMENT ON COLUMN events.no_of_stalls IS 'Number of planned stalls for the event';
ALTER TABLE events ADD CONSTRAINT check_no_of_stalls CHECK (no_of_stalls >= 0);
```

### 2. CreateEvent.tsx Fix
Added `no_of_stalls` to the `insertData` object:

```typescript
// Stalls Configuration
no_of_stalls: formData.noOfStalls,  // ← ADDED THIS LINE
in_site_stalls: formData.allStalls,
all_stalls: formData.allStalls.map(stall => stall.stallNo)
```

### 3. Events.tsx Fix  
Added `no_of_stalls` to the `updateData` object:

```typescript
// Stalls Configuration
no_of_stalls: editFormData.noOfStalls,  // ← ADDED THIS LINE
in_site_stalls: editFormData.allStalls,
all_stalls: editFormData.allStalls.map(stall => stall.stallNo)
```

### 4. Enhanced Debugging
Added console logs to track data flow:

```typescript
console.log('🔍 Raw event object keys:', Object.keys(event));
console.log('🔍 Event noOfStalls value:', event.noOfStalls);
console.log('🔍 Event no_of_stalls value:', (event as any).no_of_stalls);
```

## 🚀 **How to Apply the Fix**

### Step 1: Run Database Migration
Execute the SQL script in your Supabase database:

```bash
# Run this in your Supabase SQL editor
\i add_no_of_stalls_to_events.sql
```

### Step 2: Test the Fix
1. **Create a new event** with stalls configuration
2. **Set Number of Stalls** to a value > 0
3. **Add some stalls** to reach the limit
4. **Edit the event** - Number of Stalls should now show the correct value
5. **Validation should work** - Add Stall button should be disabled when limit reached

## 📊 **Expected Behavior After Fix**

### Before Fix
- ❌ Number of Stalls always shows 0
- ❌ Stalls validation doesn't work (can add unlimited stalls)
- ❌ Progress indicator shows "Configured stalls: X / 0"
- ❌ Warning message never appears

### After Fix  
- ✅ Number of Stalls shows actual saved value
- ✅ Stalls validation works properly (respects limit)
- ✅ Progress indicator shows "Configured stalls: X / Y"
- ✅ Warning message appears when limit reached
- ✅ Add Stall button disabled when limit reached

## 🔧 **Technical Details**

### Database Column
```sql
no_of_stalls integer DEFAULT 0
```

### TypeScript Interface
```typescript
interface Event {
  noOfStalls: number;
  // ... other fields
}
```

### Data Flow
1. **User Input** → `formData.noOfStalls`
2. **Save to DB** → `no_of_stalls` column
3. **Fetch from DB** → `event.no_of_stalls` → `event.noOfStalls`
4. **Display in UI** → Edit form shows correct value
5. **Validation** → Stalls limit enforced

## 🧪 **Testing Checklist**

- [ ] Run database migration script
- [ ] Create new event with stalls
- [ ] Set Number of Stalls > 0
- [ ] Add stalls up to limit
- [ ] Verify validation works
- [ ] Edit event - check Number of Stalls value
- [ ] Verify stalls configuration loads correctly
- [ ] Test stalls validation in edit mode

## 📝 **Files Modified**

1. **`add_no_of_stalls_to_events.sql`** - Database migration script
2. **`src/pages/CreateEvent.tsx`** - Added no_of_stalls to insertData
3. **`src/pages/Events.tsx`** - Added no_of_stalls to updateData + debugging

## 🎯 **Result**

After applying this fix, the Edit Event modal will:
- ✅ **Fetch and display** the correct Number of Stalls value
- ✅ **Enforce stalls validation** based on the saved limit
- ✅ **Show proper progress indicators** and warning messages
- ✅ **Provide consistent experience** between Create and Edit modes

The stalls configuration will now work exactly the same in both Create Event and Edit Event! 🎉
