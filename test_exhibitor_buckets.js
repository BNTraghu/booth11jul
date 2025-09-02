// Test script to verify exhibitor bucket setup
// Run this in your browser console after setting up the buckets

import { supabase } from './src/lib/supabase.js';

async function testExhibitorBuckets() {
  console.log('🧪 Testing exhibitor bucket setup...');
  
  try {
    // Test exhibitor-images bucket
    console.log('\n📸 Testing exhibitor-images bucket...');
    const { data: imageFiles, error: imageError } = await supabase.storage
      .from('exhibitor-images')
      .list('', { limit: 1 });
    
    if (imageError) {
      console.error('❌ exhibitor-images bucket error:', imageError);
    } else {
      console.log('✅ exhibitor-images bucket accessible');
      console.log('📁 Current files:', imageFiles || []);
    }
    
    // Test exhibitor-documents bucket
    console.log('\n📄 Testing exhibitor-documents bucket...');
    const { data: docFiles, error: docError } = await supabase.storage
      .from('exhibitor-documents')
      .list('', { limit: 1 });
    
    if (docError) {
      console.error('❌ exhibitor-documents bucket error:', docError);
    } else {
      console.log('✅ exhibitor-documents bucket accessible');
      console.log('📁 Current files:', docFiles || []);
    }
    
    // Test upload capability (small test file)
    console.log('\n📤 Testing upload capability...');
    const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exhibitor-documents')
      .upload('test-upload.txt', testFile);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('exhibitor-documents')
        .remove(['test-upload.txt']);
      
      if (deleteError) {
        console.error('⚠️ Could not delete test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testExhibitorBuckets();
