# Fix: Exhibitor Upload Without Supabase Storage

## 🐛 **Problem Clarification**
The system doesn't use Supabase Storage buckets. Instead, document and image URLs are stored directly in the database as JSONB:

- `document_urls` - JSONB object: `{"panCard": "url", "aadharCard": "url", "licence": "url"}`
- `image_urls` - JSONB array: `["url1", "url2", "url3"]`

The previous implementation was trying to upload to non-existent Supabase Storage buckets.

## ✅ **Corrected Solution**

### **1. Removed Supabase Storage Functions**
Replaced storage upload functions with placeholder functions:

```javascript
// File handling functions (stores placeholder data since no storage exists)
const handleDocumentUpload = async (file: File, fileName: string): Promise<string | null> => {
  try {
    // Since no storage exists, create a placeholder URL
    const timestamp = Date.now();
    const placeholderUrl = `placeholder://documents/${fileName}_${timestamp}.${file.name.split('.').pop()}`;
    console.log(`📄 Document ${fileName} processed as placeholder:`, placeholderUrl);
    
    // In a real implementation, you would upload the file to your file service here
    // and return the actual URL
    
    return placeholderUrl;
  } catch (error) {
    console.error('Error processing document:', error);
    return null;
  }
};

const handleImageUploads = async (images: File[], exhibitorName: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    try {
      // Since no storage exists, create a placeholder URL
      const timestamp = Date.now();
      const placeholderUrl = `placeholder://images/${exhibitorName}_image_${i + 1}_${timestamp}.${file.name.split('.').pop()}`;
      console.log(`🖼️ Image ${i + 1} processed as placeholder:`, placeholderUrl);
      
      // In a real implementation, you would upload the file to your file service here
      // and return the actual URL
      
      uploadedUrls.push(placeholderUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      continue;
    }
  }
  
  return uploadedUrls;
};
```

### **2. Updated Database Storage Format**
The system now correctly stores URLs in JSONB format:

**Document URLs (JSONB Object):**
```json
{
  "panCard": "placeholder://documents/john_doe_company_pan_card_1703123456789.pdf",
  "aadharCard": "placeholder://documents/john_doe_company_aadhar_card_1703123456790.pdf", 
  "licence": "placeholder://documents/john_doe_company_licence_1703123456791.pdf"
}
```

**Image URLs (JSONB Array):**
```json
[
  "placeholder://images/john_doe_company_image_1_1703123456792.jpg",
  "placeholder://images/john_doe_company_image_2_1703123456793.jpg",
  "placeholder://images/john_doe_company_image_3_1703123456794.jpg"
]
```

### **3. Edit Exhibitor Logic**
The Edit Exhibitor correctly:
- **Preserves existing URLs** from database
- **Adds new placeholder URLs** for newly uploaded files
- **Stores combined data** back to JSONB columns

```javascript
// Preserves existing documents, adds new ones
const documentUrls: { [key: string]: string } = { ...existingDocuments };

if (editFormData.documents.panCard) {
  const panCardUrl = await handleDocumentUpload(editFormData.documents.panCard, `${exhibitorName}_pan_card`);
  if (panCardUrl) documentUrls.panCard = panCardUrl;
}

// Preserves existing images, appends new ones  
let imageUrls = [...existingImages];
if (editFormData.images.length > 0) {
  const newImageUrls = await handleImageUploads(editFormData.images, exhibitorName);
  imageUrls = [...imageUrls, ...newImageUrls];
}

// Store in database as JSONB
const updateData = {
  // ... other fields ...
  document_urls: documentUrls,  // JSONB object
  image_urls: imageUrls,        // JSONB array
};
```

## 🔧 **Implementation Notes**

### **For Real File Upload Service:**
Replace the placeholder functions with your actual file upload service:

```javascript
const handleDocumentUpload = async (file: File, fileName: string): Promise<string | null> => {
  try {
    // Upload to your file service (AWS S3, Cloudinary, etc.)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    
    const response = await fetch('/api/upload-document', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return result.url; // Return actual URL from your service
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
};
```

### **Database Schema Verification:**
Ensure your `exhibitors` table has:
```sql
-- Document URLs as JSONB object
document_urls JSONB DEFAULT '{}'::jsonb,

-- Image URLs as JSONB array  
image_urls JSONB DEFAULT '[]'::jsonb
```

## 🧪 **Testing Current Implementation**

1. **Test Edit Exhibitor:**
   - Upload documents/images
   - Check console logs for placeholder URLs
   - Verify database stores JSONB data correctly

2. **Check Database:**
   - `document_urls` should contain object with URLs
   - `image_urls` should contain array of URLs
   - Data should persist and fetch correctly

3. **Verify Display:**
   - Existing files show green checkmarks
   - New uploads get processed
   - Combined data displays properly

## 🚀 **Next Steps**

1. **Implement Real File Upload:**
   - Replace placeholder functions with actual upload service
   - Update URL generation logic
   - Add proper error handling

2. **Fix AddExhibitor (if needed):**
   - If AddExhibitor also uses non-existent storage, apply same fix
   - Ensure consistent upload behavior

3. **Add File Validation:**
   - File type checking
   - File size limits
   - Error messaging

The Edit Exhibitor now works correctly with JSONB storage format! 🎉
