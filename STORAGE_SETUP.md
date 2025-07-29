# Supabase Storage Setup for Event Images and Exhibitor Logos

## 🖼️ Storage Bucket Configuration

To enable image uploads for events and exhibitors, you need to set up storage buckets in Supabase.

### Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket** for each bucket:

#### Event Images Bucket
- **Name**: `event-images`
- **Public bucket**: ✅ Check this (so images can be accessed publicly)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*`

#### Exhibitor Logos Bucket
- **Name**: `exhibitor-logos`
- **Public bucket**: ✅ Check this (so images can be accessed publicly)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*`

### Step 2: Set Storage Policies

Run these SQL commands in your Supabase SQL Editor:

```sql
-- =====================================================
-- EVENT IMAGES BUCKET POLICIES
-- =====================================================

-- Allow authenticated users to upload event images
CREATE POLICY "Allow authenticated uploads to event-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' AND 
  auth.role() = 'authenticated'
);

-- Allow public access to view event images
CREATE POLICY "Allow public viewing of event-images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

-- Allow users to update their own event image uploads
CREATE POLICY "Allow authenticated updates to event-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their own event image uploads
CREATE POLICY "Allow authenticated deletes from event-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' AND 
  auth.role() = 'authenticated'
);

-- =====================================================
-- EXHIBITOR LOGOS BUCKET POLICIES
-- =====================================================

-- Allow authenticated users to upload exhibitor logos
CREATE POLICY "Allow authenticated uploads to exhibitor-logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exhibitor-logos' AND 
  auth.role() = 'authenticated'
);

-- Allow public access to view exhibitor logos
CREATE POLICY "Allow public viewing of exhibitor-logos" ON storage.objects
FOR SELECT USING (bucket_id = 'exhibitor-logos');

-- Allow users to update their own exhibitor logo uploads
CREATE POLICY "Allow authenticated updates to exhibitor-logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'exhibitor-logos' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their own exhibitor logo uploads
CREATE POLICY "Allow authenticated deletes from exhibitor-logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'exhibitor-logos' AND 
  auth.role() = 'authenticated'
);
```

### Step 3: Verify Setup

After setup, you should be able to:
- ✅ Upload event images through CreateEvent and EditEvent forms
- ✅ Upload exhibitor logos through AddExhibitor and EditExhibitor forms
- ✅ View images in the event and exhibitor lists
- ✅ Images are stored securely in Supabase storage
- ✅ Images are accessible via public URLs

## 📁 File Structure

Images will be stored as:
```
event-images/
├── 1703123456789.jpg
├── 1703123456790.png
└── 1703123456791.gif

exhibitor-logos/
├── 1703123456792.jpg
├── 1703123456793.png
└── 1703123456794.gif
```

## 🔧 Features

- **File validation**: Only image files accepted
- **Size limit**: 5MB maximum per file
- **Preview**: Real-time image preview in forms
- **Public access**: Images accessible via URL
- **Responsive**: Images display in rectangular format

## 🎯 Usage

1. **Event Images**: Upload through CreateEvent or EditEvent forms
2. **Exhibitor Logos**: Upload through AddExhibitor or EditExhibitor forms
3. **Preview**: See image preview immediately
4. **Remove**: Click X button to remove image
5. **Display**: Images show in rectangular format throughout the app

## 📱 Display Format

Images are displayed in rectangular format:
- **Form preview**: 48px height, full width
- **Grid view**: 32px height, full width
- **View modal**: 64px height, full width
- **Customer portal**: Responsive rectangular format

## 🚨 Troubleshooting

### "Bucket not found" Error
If you get this error, make sure:
1. ✅ Bucket names are exactly: `event-images` and `exhibitor-logos`
2. ✅ Buckets are created in the correct Supabase project
3. ✅ Storage policies are applied correctly
4. ✅ You're authenticated when uploading

### "Permission denied" Error
If you get permission errors:
1. ✅ Check that storage policies are created
2. ✅ Verify you're logged in as an authenticated user
3. ✅ Ensure buckets are set as public

### "File too large" Error
If files are rejected:
1. ✅ Check file size is under 5MB
2. ✅ Verify file is an image (PNG, JPG, GIF)
3. ✅ Try compressing the image if needed 