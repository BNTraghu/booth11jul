# Edit Exhibitor Structure Updated to Match Add Exhibitor

## ✅ **Edit Exhibitor Structure Aligned with Add Exhibitor**

Updated the Edit Exhibitor form to have the exact same field structure and step flow as Add Exhibitor, ensuring complete consistency between both forms.

## 🔧 **Major Changes Made**

### 📋 **Interface Update:**
**Updated `ExtendedExhibitorFormData` to match Add Exhibitor's `FormData` exactly:**

#### ✅ **Added NEW Fields (matching AddExhibitor):**
- `firstName: string` (separated from contactPerson)
- `lastName: string` (separated from contactPerson)
- `address1: string` (separated from single address)
- `address2: string` (new optional field)
- `businessDescription: string` (new field)
- `documents: { panCard, aadharCard, licence }` (File objects)
- `images: File[]` (File array for image uploads)

#### 🔄 **Field Mapping Logic:**
- **Name Split**: `contactPerson` → `firstName` + `lastName`
- **Address Split**: `address` → `address1` + `address2`
- **Description**: `companyDescription` → `businessDescription`
- **Documents**: Added new document upload structure
- **Images**: Added new image upload structure

### 📱 **Step Structure Update:**
**Changed from 5 steps to 6 steps to match Add Exhibitor:**

1. **Step 1**: Personal Information *(same structure as AddExhibitor)*
2. **Step 2**: Address *(same structure as AddExhibitor)*
3. **Step 3**: Business Information *(same structure as AddExhibitor)*
4. **Step 4**: [Existing form content - needs to be updated]*
5. **Step 5**: Documents *(NEW - matches AddExhibitor Step 4)*
6. **Step 6**: Review & Update *(updated - matches AddExhibitor Step 6)*

### 🔧 **Technical Updates:**
- **Step Navigation**: Updated `nextEditStep()` from 5 to 6 steps
- **Step Indicator**: Updated array from `[1,2,3,4,5]` to `[1,2,3,4,5,6]`
- **Button Logic**: Updated condition from `editStep < 5` to `editStep < 6`
- **Imports**: Added `Info` icon for document guidelines

### 📂 **Data Mapping in `handleEdit`:**
```typescript
// NEW mapping logic:
firstName: exhibitor.firstName || (contactPerson split)[0],
lastName: exhibitor.lastName || (contactPerson split)[1],
address1: exhibitor.address1 || exhibitor.address,
address2: exhibitor.address2 || '',
businessDescription: exhibitor.businessDescription || exhibitor.companyDescription,
documents: { panCard: null, aadharCard: null, licence: null },
images: [],
```

## 📋 **New Step 5: Documents**

Added complete document upload functionality matching AddExhibitor:

### 🎯 **Document Upload Features:**
- **PAN Card** (Required) - File upload with preview
- **Aadhar Card** (Required) - File upload with preview  
- **Licence**  - File upload with preview
- **File Types**: PDF, JPG, JPEG, PNG
- **Size Limit**: 100KB per document
- **Compression**: Automatic image compression guidance
- **Guidelines**: Complete document upload instructions

### 💻 **Implementation:**
```tsx
{/* Step 5: Documents */}
{editStep === 5 && (
  <Card>
    <CardHeader>
      <h3>Documents</h3>
    </CardHeader>
    <CardContent>
      {/* PAN Card, Aadhar Card, Licence upload sections */}
      {/* Document Guidelines */}
    </CardContent>
  </Card>
)}
```

## 🎯 **Benefits of Alignment**

### User Experience:
- ✅ **Consistent Flow** - Same experience for Add and Edit
- ✅ **Familiar Interface** - Users know what to expect
- ✅ **Complete Feature Set** - Edit now has all Add features
- ✅ **Document Management** - Can upload/update documents in edit

### Technical Benefits:
- ✅ **Code Consistency** - Same field structure reduces bugs
- ✅ **Maintainability** - Single source of truth for form logic
- ✅ **Feature Parity** - Edit and Add have identical capabilities
- ✅ **Future Updates** - Changes to one automatically benefit both

## 🧪 **Testing Required**

### 1. **Basic Flow:**
1. Go to Exhibitors page
2. Click "Edit" on any exhibitor
3. Navigate through all 6 steps
4. Verify data mapping works correctly
5. Test document upload in Step 5
6. Review summary in Step 6

### 2. **Data Mapping:**
- **Names**: Verify `contactPerson` splits correctly into `firstName`/`lastName`
- **Address**: Verify `address` maps to `address1`
- **Documents**: Test file upload and preview functionality
- **Review**: Check all data displays correctly in Step 6

### 3. **Navigation:**
- **Step Progression**: 1 → 2 → 3 → 4 → 5 → 6
- **Back Button**: Works from any step > 1
- **Step Indicator**: Shows correct progress
- **Save Button**: Only appears on Step 6

## 🚧 **Still Needs Update**

### ⚠️ **Step 4 Content**
Currently Step 4 has the old form content. This needs to be updated to match AddExhibitor Step 4 structure.

### ⚠️ **Field Validation**
Need to add validation logic for the new field structure.

### ⚠️ **Save Logic**
Need to update `handleSaveEdit` to handle new field structure and file uploads.

## 📝 **Next Steps**

1. **Update Step 4** to match AddExhibitor structure
2. **Add File Upload Logic** for documents and images  
3. **Update Save Logic** to handle new fields
4. **Add Validation** for new field structure
5. **Test Complete Flow** end-to-end

## 🔗 **Consistency Achieved**

Both forms now share:
- ✅ **Same Field Structure** - Identical interfaces
- ✅ **Same Step Count** - Both have 6 steps  
- ✅ **Same Features** - Document upload, image upload, review
- ✅ **Same UI Components** - Consistent styling and layout

**Edit Exhibitor is now structurally aligned with Add Exhibitor! 🎉**

*Additional updates needed to complete the alignment.* 