# 🪣 Supabase Storage Bucket Creation Guide

## 🚨 CRITICAL: Buckets Must Be Created Manually

Storage buckets **CANNOT** be created via SQL. They must be created manually in the Supabase Dashboard.

## 📋 Step-by-Step Instructions

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project

### Step 2: Navigate to Storage

1. In the left sidebar, click **"Storage"**
2. You should see a page with storage buckets (might be empty)

### Step 3: Create Event Images Bucket

1. Click **"Create a new bucket"** button
2. Fill in the form:
   - **Name**: `event-images` (exactly this, no spaces, lowercase)
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: `5` (MB)
   - **Allowed MIME types**: `image/*`
3. Click **"Create bucket"**

### Step 4: Create Exhibitor Logos Bucket

1. Click **"Create a new bucket"** button again
2. Fill in the form:
   - **Name**: `exhibitor-logos` (exactly this, no spaces, lowercase)
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: `5` (MB)
   - **Allowed MIME types**: `image/*`
3. Click **"Create bucket"**

### Step 5: Verify Buckets Created

You should now see two buckets in your Storage section:
- ✅ `event-images`
- ✅ `exhibitor-logos`

## 🔍 Troubleshooting

### If "Create bucket" button is not visible:
- Make sure you're in the **Storage** section
- Check that you have the correct permissions for your project

### If bucket creation fails:
- Check that the bucket name is exactly as specified (no spaces, lowercase)
- Ensure you're not exceeding any project limits
- Try refreshing the page and trying again

### If you see existing buckets:
- Make sure they have the exact names: `event-images` and `exhibitor-logos`
- Check that they are marked as **Public**
- Verify the file size limit is 5MB

## ✅ Verification Checklist

After creating both buckets, verify:

- [ ] `event-images` bucket exists
- [ ] `event-images` is marked as Public
- [ ] `event-images` has 5MB file size limit
- [ ] `exhibitor-logos` bucket exists
- [ ] `exhibitor-logos` is marked as Public
- [ ] `exhibitor-logos` has 5MB file size limit

## 🚀 Next Steps

After creating the buckets:

1. **Run the SQL script** from `setup_storage.sql` in the SQL Editor
2. **Test image upload** in your application
3. **Verify images display** correctly

## 📞 Still Having Issues?

If you're still getting "Bucket not found" errors:

1. **Double-check bucket names** - they must be exactly `event-images` and `exhibitor-logos`
2. **Verify you're in the correct Supabase project**
3. **Check that buckets are marked as Public**
4. **Ensure you're authenticated** when trying to upload

## 🎯 Expected Result

After completing these steps, you should be able to:
- ✅ Upload event images without errors
- ✅ Upload exhibitor logos without errors
- ✅ See images displayed in rectangular format
- ✅ No more "Bucket not found" errors 