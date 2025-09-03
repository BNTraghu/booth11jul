// Quick Storage Test
// Run this in browser console after running disable_storage_rls.sql

console.log('🧪 Quick storage test...');

// Test upload immediately
async function quickTest() {
  try {
    // Create a simple test file
    const testContent = 'test';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    const fileName = `quick_test_${Date.now()}.txt`;
    
    console.log('📤 Uploading test file:', fileName);
    
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(fileName, testFile);
    
    if (error) {
      console.error('❌ Upload failed:', error);
      return false;
    }
    
    console.log('✅ Upload successful:', data.path);
    
    // Clean up
    await supabase.storage
      .from('event-images')
      .remove([fileName]);
    
    console.log('🧹 Test file cleaned up');
    console.log('🎉 Storage upload is working!');
    
    return true;
  } catch (err) {
    console.error('❌ Test error:', err);
    return false;
  }
}

// Run the test
quickTest();
