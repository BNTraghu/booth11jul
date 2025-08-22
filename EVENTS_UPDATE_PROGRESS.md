# Events Page Update to Match CreateEvent

## ✅ **COMPLETED UPDATES**

### **1. Dependencies & Imports**
- ✅ Added `useVendors`, `useExhibitors` hooks
- ✅ Added missing Lucide React icons (`CheckCircle`, `Info`, `ArrowLeft`)

### **2. Interfaces & Types**
- ✅ Added `StallConfigRow` interface matching CreateEvent
- ✅ Extended `ExtendedEventFormData` interface with all CreateEvent fields:
  - Venue facilities & amenities
  - Stalls configuration
  - Unified stall config (`allStalls`)
  - All pricing & availability fields

### **3. State Management**
- ✅ Added vendors/exhibitors selection:
  - `selectedVendors`, `selectedExhibitors` state
  - `toggleVendor()`, `toggleExhibitor()` functions
- ✅ Added stalls management functions:
  - `addStall()`, `updateStall()`, `removeStall()`

### **4. Data Mapping**
- ✅ Updated `handleEdit()` to populate all new fields from event data
- ✅ Added proper mapping for `inSiteStalls`, `noOfStalls`, etc.
- ✅ Set selected vendors/exhibitors from event data

### **5. Database Integration**
- ✅ Updated `handleSaveEdit()` with complete Supabase update:
  - Added `vendor_ids`, `exhibitor_ids`
  - Added `in_site_stalls` (JSONB array)
  - Added `all_stalls` (string array of stall numbers)
  - Added status normalization (`upcoming` → `published`)

## 🚧 **REMAINING TASKS**

### **6. Edit Modal UI**
- 🔄 **IN PROGRESS**: Update edit modal to include:
  - Vendors selection (checkboxes like CreateEvent)
  - Exhibitors selection (checkboxes like CreateEvent)
  - Stalls configuration section (add/edit/remove stalls)
  - All missing form fields

### **7. Validation**
- 🔄 **NEEDED**: Update `validateEditForm()` to include:
  - Vendors/exhibitors validation
  - Stalls validation
  - New fields validation

## 🎯 **CURRENT STATUS**

**Backend**: ✅ **COMPLETE** - All data handling, Supabase integration, and state management is ready

**Frontend**: 🔄 **NEEDS UI UPDATE** - Edit modal needs additional form sections

## 🚀 **NEXT STEPS**

1. **Add Vendors Section** to edit modal
2. **Add Exhibitors Section** to edit modal  
3. **Add Stalls Configuration** to edit modal
4. **Update validation** for new fields
5. **Test complete functionality**

The Events page now has **full CreateEvent functionality** in the backend - just needs the UI components added to the edit modal!
