// Debug Vendor Selection Issues
// Run this in browser console to check vendor selection functionality

console.log('🔍 Debugging vendor selection...');

// Check 1: Vendor data loading
function checkVendorData() {
  console.log('📊 Checking vendor data...');
  
  // Check if vendors are available in the current page
  const vendorElements = document.querySelectorAll('[class*="vendor"], [class*="Vendor"]');
  console.log('Vendor elements found:', vendorElements.length);
  
  // Check for vendor checkboxes
  const vendorCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  console.log('All checkboxes found:', vendorCheckboxes.length);
  
  // Check for vendor selection sections
  const vendorSections = document.querySelectorAll('h3, h4');
  const vendorHeaders = Array.from(vendorSections).filter(el => 
    el.textContent.toLowerCase().includes('vendor')
  );
  console.log('Vendor headers found:', vendorHeaders.length);
  vendorHeaders.forEach(header => {
    console.log('Vendor header:', header.textContent);
  });
  
  return {
    vendorElements: vendorElements.length,
    checkboxes: vendorCheckboxes.length,
    headers: vendorHeaders.length
  };
}

// Check 2: Check if we're on the right page
function checkCurrentPage() {
  console.log('📍 Checking current page...');
  
  const currentPath = window.location.pathname;
  console.log('Current path:', currentPath);
  
  const pageTitle = document.title;
  console.log('Page title:', pageTitle);
  
  // Check for page-specific elements
  const isCreateEvent = currentPath.includes('create-event') || document.querySelector('[class*="CreateEvent"]');
  const isEvents = currentPath.includes('events') || document.querySelector('[class*="Events"]');
  
  console.log('Is CreateEvent page:', !!isCreateEvent);
  console.log('Is Events page:', !!isEvents);
  
  return {
    path: currentPath,
    title: pageTitle,
    isCreateEvent: !!isCreateEvent,
    isEvents: !!isEvents
  };
}

// Check 3: Look for vendor selection UI
function findVendorUI() {
  console.log('🔍 Looking for vendor selection UI...');
  
  // Look for vendor selection containers
  const possibleVendorContainers = [
    'div[class*="vendor"]',
    'div[class*="Vendor"]',
    'section[class*="vendor"]',
    'section[class*="Vendor"]',
    '.grid[class*="vendor"]',
    '.grid[class*="Vendor"]'
  ];
  
  let foundContainers = [];
  possibleVendorContainers.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      foundContainers.push({ selector, count: elements.length });
    }
  });
  
  console.log('Found vendor containers:', foundContainers);
  
  // Look for vendor checkboxes specifically
  const vendorCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(checkbox => {
    const label = checkbox.closest('label');
    if (label) {
      const text = label.textContent.toLowerCase();
      return text.includes('vendor') || text.includes('name');
    }
    return false;
  });
  
  console.log('Vendor checkboxes found:', vendorCheckboxes.length);
  vendorCheckboxes.forEach((checkbox, index) => {
    const label = checkbox.closest('label');
    console.log(`Vendor checkbox ${index + 1}:`, label?.textContent?.trim());
  });
  
  return {
    containers: foundContainers,
    checkboxes: vendorCheckboxes.length
  };
}

// Check 4: Check for hidden elements
function checkHiddenElements() {
  console.log('👻 Checking for hidden vendor elements...');
  
  const allElements = document.querySelectorAll('*');
  const hiddenVendorElements = Array.from(allElements).filter(el => {
    const text = el.textContent?.toLowerCase() || '';
    const hasVendor = text.includes('vendor');
    const isHidden = el.style.display === 'none' || 
                    el.style.visibility === 'hidden' || 
                    el.classList.contains('hidden') ||
                    el.offsetParent === null;
    return hasVendor && isHidden;
  });
  
  console.log('Hidden vendor elements found:', hiddenVendorElements.length);
  hiddenVendorElements.forEach(el => {
    console.log('Hidden vendor element:', el.textContent?.trim());
  });
  
  return hiddenVendorElements.length;
}

// Check 5: Test vendor selection functionality
function testVendorSelection() {
  console.log('🧪 Testing vendor selection...');
  
  const vendorCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(checkbox => {
    const label = checkbox.closest('label');
    if (label) {
      const text = label.textContent.toLowerCase();
      return text.includes('vendor') || text.includes('name');
    }
    return false;
  });
  
  if (vendorCheckboxes.length > 0) {
    console.log('✅ Vendor checkboxes found, testing selection...');
    
    // Try to click the first vendor checkbox
    const firstCheckbox = vendorCheckboxes[0];
    const wasChecked = firstCheckbox.checked;
    
    console.log('First checkbox state before click:', wasChecked);
    
    // Simulate click
    firstCheckbox.click();
    
    setTimeout(() => {
      console.log('First checkbox state after click:', firstCheckbox.checked);
      console.log('✅ Vendor selection test completed');
    }, 100);
    
    return true;
  } else {
    console.log('❌ No vendor checkboxes found');
    return false;
  }
}

// Run all checks
function runVendorDebug() {
  console.log('🚀 Running vendor selection debug...');
  
  const results = {
    page: checkCurrentPage(),
    data: checkVendorData(),
    ui: findVendorUI(),
    hidden: checkHiddenElements(),
    test: testVendorSelection()
  };
  
  console.log('📊 Vendor Debug Results:', results);
  
  // Provide recommendations
  if (results.ui.checkboxes === 0) {
    console.log('💡 RECOMMENDATION: No vendor checkboxes found - check vendor data loading');
  }
  
  if (results.hidden > 0) {
    console.log('💡 RECOMMENDATION: Vendor elements are hidden - check CSS or conditional rendering');
  }
  
  if (results.data.headers === 0) {
    console.log('💡 RECOMMENDATION: No vendor headers found - check if vendor section is rendered');
  }
  
  return results;
}

// Auto-run debug
runVendorDebug();

// Export for manual testing
window.debugVendorSelection = runVendorDebug;
