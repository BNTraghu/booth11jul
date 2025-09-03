// Test Vendor Data Loading
// Run this in browser console to check vendor data

console.log('🧪 Testing vendor data...');

// Test 1: Check if vendors are loaded in the page
function checkVendorData() {
  console.log('📊 Checking vendor data in page...');
  
  // Check if vendors are available in the current page context
  if (typeof window !== 'undefined') {
    // Look for vendor data in React components
    const vendorElements = document.querySelectorAll('[class*="vendor"], [class*="Vendor"]');
    console.log('Vendor elements found:', vendorElements.length);
    
    // Look for vendor checkboxes
    const vendorCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(checkbox => {
      const label = checkbox.closest('label');
      if (label) {
        const text = label.textContent.toLowerCase();
        return text.includes('vendor') || text.includes('name');
      }
      return false;
    });
    
    console.log('Vendor checkboxes found:', vendorCheckboxes.length);
    
    return {
      elements: vendorElements.length,
      checkboxes: vendorCheckboxes.length
    };
  }
  
  return { elements: 0, checkboxes: 0 };
}

// Test 2: Check vendor data from Supabase
async function checkVendorDatabase() {
  console.log('🗄️ Checking vendor database...');
  
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Database error:', error);
      return { count: 0, error: error.message };
    }
    
    console.log('✅ Vendors in database:', data.length);
    console.log('📋 Vendor data:', data);
    
    return { count: data.length, data: data };
  } catch (err) {
    console.error('❌ Database check error:', err);
    return { count: 0, error: err.message };
  }
}

// Test 3: Check vendor selection functionality
function testVendorSelection() {
  console.log('🔍 Testing vendor selection...');
  
  const vendorCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(checkbox => {
    const label = checkbox.closest('label');
    if (label) {
      const text = label.textContent.toLowerCase();
      return text.includes('vendor') || text.includes('name');
    }
    return false;
  });
  
  if (vendorCheckboxes.length > 0) {
    console.log('✅ Found vendor checkboxes:', vendorCheckboxes.length);
    
    // Show vendor names
    vendorCheckboxes.forEach((checkbox, index) => {
      const label = checkbox.closest('label');
      const vendorName = label?.textContent?.trim();
      const isChecked = checkbox.checked;
      console.log(`Vendor ${index + 1}: ${vendorName} (${isChecked ? 'selected' : 'not selected'})`);
    });
    
    return true;
  } else {
    console.log('❌ No vendor checkboxes found');
    return false;
  }
}

// Test 4: Check if vendor sections are visible
function checkVendorSections() {
  console.log('👀 Checking vendor sections visibility...');
  
  // Look for vendor sections with blue borders (our enhanced styling)
  const vendorSections = document.querySelectorAll('div[class*="border-blue-200"]');
  console.log('Blue-bordered sections found:', vendorSections.length);
  
  vendorSections.forEach((section, index) => {
    const text = section.textContent?.toLowerCase() || '';
    if (text.includes('vendor')) {
      console.log(`Vendor section ${index + 1}:`, section.textContent?.trim());
    }
  });
  
  // Look for vendor headers
  const vendorHeaders = Array.from(document.querySelectorAll('h3, h4')).filter(el => 
    el.textContent.toLowerCase().includes('vendor')
  );
  
  console.log('Vendor headers found:', vendorHeaders.length);
  vendorHeaders.forEach(header => {
    console.log('Vendor header:', header.textContent);
  });
  
  return {
    sections: vendorSections.length,
    headers: vendorHeaders.length
  };
}

// Run all tests
async function runVendorTests() {
  console.log('🚀 Running vendor data tests...');
  
  const results = {
    pageData: checkVendorData(),
    database: await checkVendorDatabase(),
    selection: testVendorSelection(),
    sections: checkVendorSections()
  };
  
  console.log('📊 Vendor Test Results:', results);
  
  // Provide recommendations
  if (results.database.count === 0) {
    console.log('💡 RECOMMENDATION: No vendors in database - add some vendors first');
  }
  
  if (results.pageData.checkboxes === 0) {
    console.log('💡 RECOMMENDATION: No vendor checkboxes found - check if vendor data is loading');
  }
  
  if (results.sections.sections === 0) {
    console.log('💡 RECOMMENDATION: No vendor sections found - check if you\'re on the right page');
  }
  
  if (results.database.count > 0 && results.pageData.checkboxes === 0) {
    console.log('💡 RECOMMENDATION: Vendors exist in database but not showing in UI - check data loading');
  }
  
  return results;
}

// Auto-run tests
runVendorTests();

// Export for manual testing
window.testVendorData = runVendorTests;
