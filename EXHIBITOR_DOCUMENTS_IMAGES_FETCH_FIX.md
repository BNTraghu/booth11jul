# Fix: Exhibitor Edit Document & Image Fetching

## 🐛 **Problem**
When editing an exhibitor in the Exhibitors page, uploaded documents (PAN Card, Aadhar Card, Licence) and images were not being fetched and displayed. The edit form showed empty upload sections even when files were previously uploaded.

## 🔍 **Root Cause Analysis**

### 1. **Missing Database Field Mapping**
The `useExhibitors` hook was not fetching document and image URLs from the database:
- `document_urls` field from database not mapped
- `image_urls` field from database not mapped

### 2. **Incomplete TypeScript Interfaces**
The `Exhibitor` interface was missing fields for:
- `documentUrls` - URLs for uploaded documents  
- `imageUrls` - Array of uploaded image URLs

### 3. **No Existing Document/Image Display Logic**
The edit form had no logic to:
- Display existing documents with view links
- Show existing images with previews
- Differentiate between new uploads and existing files

## ✅ **Complete Solution Applied**

### **1. Updated Exhibitor Interface** (`src/types/index.ts`)
Added document and image URL fields:
```typescript
export interface Exhibitor {
  // ... existing fields
  
  // Documents & Images (NEW - matching AddExhibitor Steps 4 & 5)
  documentUrls?: {
    panCard?: string | null;
    aadharCard?: string | null;
    licence?: string | null;
  } | null; // document_urls from DB
  imageUrls?: string[] | null; // image_urls from DB
  
  // ... rest of interface
}
```

### **2. Updated useExhibitors Hook** (`src/hooks/useSupabaseData.ts`)
Added database field mapping for documents and images:
```javascript
const exhibitors: Exhibitor[] = data.map((exhibitor: any) => ({
  // ... existing mappings
  
  // Documents & Images (NEW - matching AddExhibitor Steps 4 & 5)
  documentUrls: exhibitor.document_urls || {
    panCard: null,
    aadharCard: null,
    licence: null
  },
  imageUrls: exhibitor.image_urls || [],
  
  // ... rest of mappings
}));
```

### **3. Enhanced ExhibitorFormData Interface** (`src/pages/Exhibitors.tsx`)
Added support for both files and URLs:
```typescript
interface ExhibitorFormData {
  // ... existing fields
  
  // Documents (supports both files and URLs)
  documents: {
    panCard: File | null;
    aadharCard: File | null;
    licence: File | null;
  };
  documentUrls?: {
    panCard?: string | null;
    aadharCard?: string | null;
    licence?: string | null;
  };
  
  // Images (supports both files and URLs)
  images: File[];
  imageUrls?: string[];
  
  // ... rest of interface
}
```

### **4. Added State Management for Existing Files**
Added state variables to track existing documents and images:
```javascript
const [existingDocuments, setExistingDocuments] = useState<{[key: string]: string}>({});
const [existingImages, setExistingImages] = useState<string[]>([]);
```

### **5. Updated handleEdit Function**
Enhanced to populate existing document and image data:
```javascript
const handleEdit = (exhibitor: any) => {
  // ... existing logic
  
  // Set existing documents and images for display
  setExistingDocuments({
    panCard: exhibitor.documentUrls?.panCard || '',
    aadharCard: exhibitor.documentUrls?.aadharCard || '',
    licence: exhibitor.documentUrls?.licence || ''
  });
  setExistingImages(exhibitor.imageUrls || []);
  
  // Map Exhibitor data including URLs
  setEditFormData({
    // ... existing field mappings
    
    // Documents (Step 4 - matching AddExhibitor)
    documents: {
      panCard: null,
      aadharCard: null,
      licence: null
    },
    documentUrls: exhibitor.documentUrls || {
      panCard: null,
      aadharCard: null,
      licence: null
    },
    
    // Upload Images (Step 5 - matching AddExhibitor)
    images: [],
    imageUrls: exhibitor.imageUrls || [],
    
    // ... rest of mappings
  });
}
```

### **6. Enhanced Document Upload UI (Step 4)**
Updated each document section to show existing documents:

**PAN Card Section:**
```jsx
{editFormData?.documents.panCard && (
  <p className="text-xs text-green-600 mt-2">
    ✓ {editFormData.documents.panCard.name}
  </p>
)}
{!editFormData?.documents.panCard && existingDocuments.panCard && (
  <div className="mt-2">
    <p className="text-xs text-blue-600 mb-1">✓ Current PAN Card uploaded</p>
    <a 
      href={existingDocuments.panCard} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-xs text-blue-500 hover:text-blue-700 underline"
    >
      View Current Document
    </a>
  </div>
)}
```

**Aadhar Card & Licence Sections:**
- Same pattern applied to show existing documents
- View links open documents in new tab
- Clear visual indicators for current vs new uploads

### **7. Enhanced Image Upload UI (Step 5)**
Added existing images display section:
```jsx
{/* Existing Images Section */}
{existingImages.length > 0 && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Current Images ({existingImages.length})
    </label>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {existingImages.map((imageUrl, index) => (
        <div key={index} className="relative">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={`Existing image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-1 right-1">
            <Badge variant="success" className="text-xs">Current</Badge>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Upload New Images
  </label>
  {/* New image upload interface */}
</div>
```

## 🎯 **Key Features Implemented**

### ✅ **Document Management**
- **Existing documents display** with view links
- **Clear status indicators** (Current vs New)
- **PAN Card, Aadhar Card, Licence support**
- **Direct document viewing** in new tabs

### ✅ **Image Management**  
- **Existing images preview grid** with thumbnails
- **Current vs New image differentiation**
- **Responsive grid layout** (2 cols mobile, 4 cols desktop)
- **Professional status badges**

### ✅ **User Experience**
- **Visual separation** between existing and new uploads
- **No data loss** - existing files always visible
- **Consistent UI patterns** across all document types
- **Clear upload instructions** and guidelines

### ✅ **Database Integration**
- **Proper field mapping** from `document_urls` and `image_urls`
- **Type safety** with updated interfaces
- **Fallback handling** for missing data

## 🧪 **Testing Instructions**
1. **Go to Exhibitors page**
2. **Click Edit on an exhibitor with uploaded documents/images**
3. **Navigate to Step 4 (Documents):**
   - Verify existing PAN Card, Aadhar Card, Licence show with "View Current Document" links
   - Click links to verify documents open in new tab
   - Upload new documents to see both existing and new indicators
4. **Navigate to Step 5 (Images):**
   - Verify "Current Images" section shows existing uploaded images
   - Verify images display in responsive grid with "Current" badges
   - Upload new images to see both existing and new images sections

## 🚀 **Result**
- ✅ **All uploaded documents** now visible in edit form
- ✅ **All uploaded images** display with proper previews
- ✅ **Professional UI** with clear visual indicators
- ✅ **Direct document access** via view links  
- ✅ **No data loss** - existing uploads always preserved
- ✅ **Seamless integration** with AddExhibitor patterns

The Exhibitors edit form now provides complete visibility into all previously uploaded documents and images! 🎉
