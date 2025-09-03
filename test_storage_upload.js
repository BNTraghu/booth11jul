// Test Storage Upload
// Run this in browser console to test image upload after fixing RLS

console.log('🧪 Testing storage upload...');

// Test 1: Check if event-images bucket exists
async function checkBucket() {
  console.log('🔍 Checking event-images bucket...');
  
  try {
    const { data, error } = await supabase.storage
      .from('event-images')
      .list();
    
    if (error) {
      console.error('❌ Bucket access failed:', error);
      return false;
    }
    
    console.log('✅ event-images bucket accessible');
    console.log('📁 Files in bucket:', data.length);
    return true;
  } catch (err) {
    console.error('❌ Bucket check error:', err);
    return false;
  }
}

// Test 2: Test file upload
async function testUpload() {
  console.log('📤 Testing file upload...');
  
  try {
    // Create a simple test file
    const testContent = 'This is a test file for upload verification';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    const fileName = `test_${Date.now()}.txt`;
    const filePath = `test/${fileName}`;
    
    console.log('📁 Uploading test file:', filePath);
    
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(filePath, testFile);
    
    if (error) {
      console.error('❌ Upload failed:', error);
      return false;
    }
    
    console.log('✅ Upload successful:', data.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // Clean up - delete the test file
    await supabase.storage
      .from('event-images')
      .remove([filePath]);
    
    console.log('🧹 Test file cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Upload test error:', err);
    return false;
  }
}

// Test 3: Test image upload (simulated)
async function testImageUpload() {
  console.log('🖼️ Testing image upload simulation...');
  
  try {
    // Create a simple image-like file
    const imageContent = 'fake-image-data';
    const imageFile = new File([imageContent], 'test.jpg', { type: 'image/jpeg' });
    
    const fileName = `test_image_${Date.now()}.jpg`;
    const filePath = `event-images/${fileName}`;
    
    console.log('📁 Uploading test image:', filePath);
    
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile);
    
    if (error) {
      console.error('❌ Image upload failed:', error);
      return false;
    }
    
    console.log('✅ Image upload successful:', data.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);
    
    console.log('🔗 Image URL:', urlData.publicUrl);
    
    // Clean up
    await supabase.storage
      .from('event-images')
      .remove([filePath]);
    
    console.log('🧹 Test image cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Image upload test error:', err);
    return false;
  }
}

// Run all tests
async function runStorageTests() {
  console.log('🚀 Running storage tests...');
  
  const results = {
    bucketAccess: await checkBucket(),
    fileUpload: await testUpload(),
    imageUpload: await testImageUpload()
  };
  
  console.log('📊 Storage Test Results:', results);
  
  if (results.bucketAccess && results.fileUpload && results.imageUpload) {
    console.log('✅ All storage tests passed!');
    console.log('💡 Image upload should now work in the CreateEvent form');
  } else {
    console.log('❌ Some storage tests failed');
    console.log('💡 Run the fix_storage_rls.sql script in Supabase SQL Editor');
  }
  
  return results;
}

// Auto-run tests
runStorageTests();

// Export for manual testing
window.testStorage = runStorageTests;
