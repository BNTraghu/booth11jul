# Fix: Stalls Not Fetching in Events Edit

## 🐛 **Problem**
When editing an event in the Events page, the previously configured stalls were not appearing in the edit form.

## 🔍 **Root Cause**
Two issues were identified:

### 1. **Missing Database Fields in useEvents Hook**
The `useEvents` hook in `src/hooks/useSupabaseData.ts` was not fetching the stalls-related fields from the database.

**Missing fields:**
- `exhibitor_ids` → `exhibitors`
- `no_of_stalls` → `noOfStalls`  
- `in_site_stalls` → `inSiteStalls`
- `out_site_stalls` → `outSiteStalls`
- `all_stalls` → `allStalls`

### 2. **Incorrect Data Mapping in Events handleEdit**
The `handleEdit` function in Events was trying to access `event.inSiteStalls` but wasn't properly transforming the JSONB data to the expected `StallConfigRow[]` format.

## ✅ **Solution Applied**

### **1. Updated useEvents Hook**
Added missing stalls fields to the event transformation:

```javascript
// Stalls Configuration
exhibitors: event.exhibitor_ids || [],
noOfStalls: event.no_of_stalls,
inSiteStalls: event.in_site_stalls || [],
outSiteStalls: event.out_site_stalls || [],
allStalls: event.all_stalls || [],
```

### **2. Fixed Data Mapping in Events handleEdit**
Updated the stalls mapping to properly transform JSONB data:

```javascript
// Unified stall config
allStalls: (event.inSiteStalls || []).map((stall: any) => ({
  id: stall.id || Date.now().toString(),
  stallNo: stall.stallNo || '',
  stallSize: stall.stallSize || '',
  stallCategory: stall.stallCategory || '',
  price: stall.price || 0
}))
```

### **3. Added Debug Logging**
Added console logs to help track stalls data flow:

```javascript
console.log('🏪 Event stalls data:', {
  inSiteStalls: event.inSiteStalls,
  allStalls: event.allStalls,
  noOfStalls: event.noOfStalls
});
console.log('📝 Mapped stalls data:', editData.allStalls);
```

## 🚀 **Result**
- ✅ **Stalls data now fetches** from database correctly
- ✅ **Edit form populates** with existing stalls
- ✅ **Debug logging** shows data transformation process
- ✅ **Full compatibility** with CreateEvent stalls format

## 🧪 **Testing**
1. Create an event with stalls in CreateEvent
2. Go to Events page and click Edit on that event
3. Verify stalls appear in the "Stalls Configuration" section
4. Check browser console for debug logs showing data flow

The stalls should now properly appear when editing events!
