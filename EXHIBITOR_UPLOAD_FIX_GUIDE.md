# Exhibitor Document Upload Fix Guide

## 🔧 Issues Fixed

### 1. **Document Upload Functionality**
- ✅ Added proper file validation (type, size)
- ✅ Added file upload to Supabase Storage
- ✅ Added error handling and user feedback
- ✅ Document URLs saved to database

### 2. **Form Structure Updated**
- ✅ Updated to 6 steps (added Review & Submit)
- ✅ Proper validation for each step
- ✅ Navigation updated to support 6 steps

### 3. **Supabase Integration**
- ✅ Documents uploaded to `exhibitor-documents` bucket
- ✅ Images uploaded to `exhibitor-images` bucket
- ✅ File URLs stored in database

## 📋 Setup Required

### Step 1: Run Database Migration
Execute `update_exhibitor_table_personal_info.sql` in your Supabase SQL editor to add required fields.

### Step 2: Setup Storage Buckets
Execute `setup_exhibitor_storage.sql` in your Supabase SQL editor to:
- Create `exhibitor-documents` bucket
- Create `exhibitor-images` bucket
- Set up proper RLS policies

### Step 3: Verify Bucket Creation
Go to **Storage** in your Supabase dashboard and confirm both buckets exist:
- `exhibitor-documents` (public)
- `exhibitor-images` (public)

## 🧪 Testing the Upload Functionality

### Test Document Upload:
1. Navigate to Add Exhibitor form
2. Complete Steps 1-3 (Personal Info, Address, Business Info)
3. On Step 4 (Documents):
   - Upload PAN Card (PDF/Image, max 5MB)
   - Upload Aadhar Card (PDF/Image, max 5MB) 
   - Upload Licence (optional)
4. Check for validation errors
5. Proceed to Step 5 and 6

### Test Image Upload:
1. On Step 5 (Upload Images):
   - Select multiple images
   - Check preview functionality
   - Remove images if needed

### Test Submission:
1. On Step 6 (Review & Submit):
   - Review all entered data
   - Click "Register Exhibitor"
   - Check Supabase Storage for uploaded files
   - Check database for stored URLs

## 🐛 Common Issues & Solutions

### Issue: "Bucket not found"
**Solution**: Run `setup_exhibitor_storage.sql` to create buckets

### Issue: "Permission denied"
**Solution**: Check RLS policies are properly set up

### Issue: "File too large"
**Solution**: File must be under 5MB

### Issue: "Invalid file type"
**Solution**: Only PDF, JPG, JPEG, PNG files allowed

## ✅ What's Working Now

1. **File Validation**: Type and size checks
2. **Progress Indicators**: Clear error messages
3. **File Preview**: Shows selected files
4. **Storage Integration**: Files uploaded to Supabase
5. **Database Storage**: URLs saved to exhibitor record
6. **Form Navigation**: 6-step process with validation

## 📊 Database Fields Added

The migration adds these fields to the `exhibitors` table:
- `first_name` (text)
- `last_name` (text)
- `address1` (text)
- `address2` (text)
- `pan_number` (text)
- `booth_size` (text)
- `business_description` (text)
- `facebook_url` (text)
- `linkedin_url` (text)
- `instagram_url` (text)
- `twitter_url` (text)
- `image_urls` (jsonb)
- `document_urls` (jsonb)

After following this guide, document and image uploads should work properly in your Add Exhibitor form! 