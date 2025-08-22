# Document Upload Fix & File Size Update

## 🔧 **Issues Fixed**

### 1. **Document Upload Not Working**
**Problem**: Clicking "Choose File" buttons in Step 4 (Documents) was not opening file picker.

**Root Cause**: Button component inside `<label>` was interfering with click events.

**Solution**: Replaced Button components with styled `<label>` elements that work properly with file inputs.

### 2. **File Size Limits Updated**
**Problem**: 5MB file size limit was too large.

**Solution**: Updated all file size limits from **5MB to 100KB** for both documents and images.

## ✅ **Changes Applied**

### 1. **Document Upload Buttons Fixed**
**Before (Not Working)**:
```tsx
<label htmlFor="panCard-upload">
  <Button size="sm" variant="outline" type="button">
    Choose File
  </Button>
</label>
```

**After (Working)**:
```tsx
<label 
  htmlFor="panCard-upload" 
  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
>
  Choose File
</label>
```

### 2. **File Size Validation Updated**
**Documents**:
```typescript
// Before: 5MB limit
if (file.size > 5 * 1024 * 1024) {
  setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
}

// After: 100KB limit
if (file.size > 100 * 1024) {
  setErrors(prev => ({ ...prev, [field]: 'File size must be less than 100KB' }));
}
```

**Images**:
- Added file size validation for image uploads
- Added file type validation
- Added error display for image upload errors

### 3. **Image Upload Validation Added**
```typescript
files.forEach(file => {
  // Check file size (100KB max)
  if (file.size > 100 * 1024) {
    setErrors(prev => ({ 
      ...prev, 
      images: `File "${file.name}" is too large. Maximum size is 100KB.` 
    }));
    return;
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    setErrors(prev => ({ 
      ...prev, 
      images: `File "${file.name}" is not a valid image.` 
    }));
    return;
  }
  
  validFiles.push(file);
});
```

### 4. **Guidelines Updated**
**Document Guidelines**:
- ✅ Maximum file size: 100KB per document
- ✅ Accepted formats: PDF, JPG, JPEG, PNG

**Image Guidelines**:
- ✅ Maximum file size: 100KB per image
- ✅ Accepted formats: JPG, JPEG, PNG

## 🧪 **Testing**

### Step 4 - Documents:
1. **Click "Choose File" for PAN Card** → Should open file picker ✅
2. **Select a file > 100KB** → Should show "File size must be less than 100KB" ❌
3. **Select a file < 100KB** → Should upload and show ✓ filename ✅
4. **Try same for Aadhar Card and Licence** → Should work ✅

### Step 5 - Images:
1. **Click "Choose Images"** → Should open file picker ✅
2. **Select images > 100KB** → Should show size error ❌
3. **Select images < 100KB** → Should show preview ✅
4. **Select non-image files** → Should show type error ❌

## ✅ **What Works Now**

### Document Upload:
- ✅ File picker opens when clicking buttons
- ✅ 100KB file size limit enforced
- ✅ File type validation (PDF, JPG, JPEG, PNG)
- ✅ Error messages displayed
- ✅ Selected files shown with ✓ checkmark

### Image Upload:
- ✅ Multiple image selection
- ✅ 100KB file size validation per image
- ✅ Image type validation
- ✅ Error messages for invalid files
- ✅ Image previews shown
- ✅ Remove individual images

## 🚨 **Important Notes**

### File Size Compression:
- Users may need to compress their files to under 100KB
- Consider providing compression tips or tools
- PDF files especially may be larger than 100KB

### User Experience:
- Clear error messages show which files are too large
- File names are displayed for better feedback
- Guidelines clearly state the 100KB limit

**All document and image upload issues are now fixed with 100KB file size limits!** 🎉 