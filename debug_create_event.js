// Debug CreateEvent Issues
// Run this in browser console to identify the specific problem

console.log('🔍 Starting CreateEvent Debug...');

// Test 1: Check if we can access the form data
function checkFormData() {
  console.log('📋 Checking form data...');
  
  // Get form elements
  const titleInput = document.querySelector('input[name="title"]') || document.querySelector('input[placeholder*="title"]');
  const descriptionInput = document.querySelector('textarea[name="description"]') || document.querySelector('textarea[placeholder*="description"]');
  const dateInput = document.querySelector('input[type="date"]');
  const venueSelect = document.querySelector('select[name="venueId"]') || document.querySelector('select');
  
  console.log('Form elements found:', {
    title: !!titleInput,
    description: !!descriptionInput,
    date: !!dateInput,
    venue: !!venueSelect
  });
  
  return { titleInput, descriptionInput, dateInput, venueSelect };
}

// Test 2: Check validation errors
function checkValidationErrors() {
  console.log('✅ Checking for validation errors...');
  
  const errorElements = document.querySelectorAll('[class*="error"], [class*="red"], .text-red-600, .text-red-500');
  const errorMessages = Array.from(errorElements).map(el => el.textContent).filter(text => text && text.trim());
  
  console.log('Validation errors found:', errorMessages);
  
  return errorMessages;
}

// Test 3: Check if Supabase is available
function checkSupabase() {
  console.log('🔌 Checking Supabase connection...');
  
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase is not available');
    return false;
  }
  
  console.log('✅ Supabase is available');
  return true;
}

// Test 4: Test minimal event creation
async function testMinimalEvent() {
  console.log('🧪 Testing minimal event creation...');
  
  if (!checkSupabase()) {
    return false;
  }
  
  try {
    const testEvent = {
      title: 'Debug Test Event',
      description: 'Testing minimal event creation',
      event_date: '2024-12-31',
      event_time: '18:00',
      venue_name: 'Test Venue',
      city: 'Test City',
      max_capacity: 100,
      plan_type: 'Plan A',
      status: 'draft',
      attendees: 0,
      total_revenue: 0,
      created_by: null,
      vendor_ids: [],
      exhibitor_ids: [],
      event_image_url: null,
      layout_image_url: null,
      price_per_hour: 0,
      available_hours: '9:00 AM - 11:00 PM',
      parking_spaces: 10,
      catering_allowed: false,
      alcohol_allowed: false,
      smoking_allowed: false,
      no_of_stalls: 0,
      in_site_stalls: [],
      all_stalls: []
    };
    
    console.log('📤 Attempting to insert test event...');
    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Database insertion failed:', error);
      return false;
    }
    
    console.log('✅ Test event created successfully:', data.id);
    
    // Clean up
    await supabase.from('events').delete().eq('id', data.id);
    console.log('🧹 Test event cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Test event creation error:', err);
    return false;
  }
}

// Test 5: Check current form state
function checkCurrentFormState() {
  console.log('📝 Checking current form state...');
  
  const form = document.querySelector('form');
  if (!form) {
    console.error('❌ No form found');
    return;
  }
  
  const formData = new FormData(form);
  const formObject = {};
  
  for (let [key, value] of formData.entries()) {
    formObject[key] = value;
  }
  
  console.log('Current form data:', formObject);
  
  // Check for required fields
  const requiredFields = ['title', 'description', 'eventDate', 'eventTime', 'venueId', 'city'];
  const missingFields = requiredFields.filter(field => !formObject[field] || formObject[field].trim() === '');
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Missing required fields:', missingFields);
  } else {
    console.log('✅ All required fields are filled');
  }
  
  return formObject;
}

// Run all tests
async function runDebugTests() {
  console.log('🚀 Running CreateEvent debug tests...');
  
  const results = {
    formElements: checkFormData(),
    validationErrors: checkValidationErrors(),
    supabase: checkSupabase(),
    formState: checkCurrentFormState(),
    minimalEvent: await testMinimalEvent()
  };
  
  console.log('📊 Debug Results:', results);
  
  // Provide recommendations
  if (results.validationErrors.length > 0) {
    console.log('💡 RECOMMENDATION: Fix validation errors first');
  }
  
  if (!results.supabase) {
    console.log('💡 RECOMMENDATION: Check Supabase configuration');
  }
  
  if (!results.minimalEvent) {
    console.log('💡 RECOMMENDATION: Database schema issue - run the database fix script');
  }
  
  if (results.minimalEvent && results.validationErrors.length === 0) {
    console.log('💡 RECOMMENDATION: Form validation is likely failing - check required fields');
  }
  
  return results;
}

// Auto-run when script is loaded
runDebugTests();

// Export for manual testing
window.debugCreateEvent = runDebugTests;
