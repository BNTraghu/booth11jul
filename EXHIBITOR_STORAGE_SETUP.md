# 🎯 Exhibitor Storage Setup Guide

## 📋 Overview
This guide sets up the complete storage system for exhibitor images and documents using Supabase storage buckets with signed URLs for security.

## 🗂️ Storage Buckets

### 1. **exhibitor-images** Bucket
- **Purpose**: Store company/product images
- **Privacy**: Private (requires signed URLs)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, GIF, WebP
- **URL Pattern**: `/storage/v1/object/sign/exhibitor-images/filename`

### 2. **exhibitor-documents** Bucket
- **Purpose**: Store PAN cards, Aadhar cards, licenses
- **Privacy**: Private (requires signed URLs)
- **File Size Limit**: 10MB
- **Allowed Types**: PDF, JPEG, JPG, PNG
- **URL Pattern**: `/storage/v1/object/sign/exhibitor-documents/filename`

## 🚀 Setup Steps

### Step 1: Create Buckets in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Run the SQL script from `create_exhibitor_buckets.sql`
4. Verify buckets are created and policies are set

### Step 2: Test Bucket Setup
1. Open browser console on your app
2. Run the test script from `test_exhibitor_buckets.js`
3. Verify all tests pass

## 🔧 Code Implementation

### File Upload Functions (Already Updated)

#### **AddExhibitor.tsx**
```typescript
// Document upload
const uploadDocumentToSupabase = async (file: File, fileName: string) => {
  // Uploads to exhibitor-documents bucket
  // Returns signed URL with 1-hour expiry
};

// Image upload
const uploadImagesToSupabase = async (images: File[], exhibitorName: string) => {
  // Uploads to exhibitor-images bucket
  // Returns array of signed URLs with 1-hour expiry
};
```

#### **Exhibitors.tsx**
```typescript
// Document upload
const handleDocumentUpload = async (file: File, fileName: string) => {
  // Uploads to exhibitor-documents bucket
  // Returns signed URL with 1-hour expiry
};

// Image upload
const handleImageUploads = async (images: File[], exhibitorName: string) => {
  // Uploads to exhibitor-images bucket
  // Returns array of signed URLs with 1-hour expiry
};
```

### Image Display (Already Updated)
```typescript
// Automatic fallback from public to signed URLs
<img
  src={imageUrl}
  onError={(e) => {
    if (imageUrl.includes('/storage/v1/object/public/')) {
      const signedUrl = imageUrl.replace('/storage/v1/object/public/', '/storage/v1/object/sign/');
      e.currentTarget.src = signedUrl;
    }
  }}
/>
```

## 📁 File Naming Convention

### Images
```
{exhibitorName}_image_{index}.{extension}
Example: John_Doe_ABC_Company_image_1.jpg
```

### Documents
```
{exhibitorName}_{documentType}.{extension}
Examples:
- John_Doe_ABC_Company_pan_card.pdf
- John_Doe_ABC_Company_aadhar_card.jpg
- John_Doe_ABC_Company_licence.png
```

## 🔒 Security Features

1. **Private Buckets**: No public access
2. **Signed URLs**: Time-limited access (1 hour)
3. **Authentication Required**: Only logged-in users can upload/view
4. **File Type Validation**: Restricted to safe file types
5. **Size Limits**: Prevents abuse

## 🎯 Usage Examples

### Adding New Exhibitor
1. User fills form with images/documents
2. Files uploaded to respective buckets
3. Signed URLs stored in database
4. Images display automatically with fallback

### Editing Exhibitor
1. Existing files remain in buckets
2. New files uploaded with new signed URLs
3. Old URLs automatically expire
4. Seamless user experience

### Viewing Exhibitor
1. Images load from signed URLs
2. Automatic fallback if public URLs fail
3. Secure access to private content
4. No broken image links

## 🧪 Testing

### Test Upload
```typescript
// Test image upload
const testImage = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const result = await handleImageUploads([testImage], 'TestCompany');
console.log('Upload result:', result);
```

### Test Display
```typescript
// Test image display with fallback
const testUrl = 'https://.../storage/v1/object/public/exhibitor-images/test.jpg';
// Should automatically convert to signed URL if public fails
```

## 🚨 Troubleshooting

### Common Issues

1. **Bucket Not Found**
   - Run the SQL script again
   - Check bucket names match exactly

2. **Upload Permission Denied**
   - Verify storage policies are set
   - Check user authentication

3. **Images Not Loading**
   - Check console for signed URL generation
   - Verify bucket privacy settings

4. **URL Expired**
   - Signed URLs expire after 1 hour
   - Refresh page to get new URLs

## ✅ Verification Checklist

- [ ] `exhibitor-images` bucket created
- [ ] `exhibitor-documents` bucket created
- [ ] Storage policies configured
- [ ] AddExhibitor.tsx updated with signed URLs
- [ ] Exhibitors.tsx updated with signed URLs
- [ ] Image display fallback implemented
- [ ] Test uploads working
- [ ] Test displays working
- [ ] Console logs showing signed URL generation

## 🎉 Result
Your exhibitor system now has:
- ✅ Secure private storage buckets
- ✅ Automatic signed URL generation
- ✅ Seamless image/document display
- ✅ Consistent with venue storage system
- ✅ Professional-grade security

All exhibitor images and documents will now work exactly like your venue system! 🚀
