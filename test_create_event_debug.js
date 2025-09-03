// Debug CreateEvent Component Issues
// Run this in browser console to test event creation

// Test 1: Check if Supabase connection works
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
}

// Test 2: Check events table structure
async function checkEventsTable() {
  console.log('🔍 Checking events table structure...');
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Events table access failed:', error);
      return false;
    }
    
    console.log('✅ Events table accessible');
    return true;
  } catch (err) {
    console.error('❌ Events table error:', err);
    return false;
  }
}

// Test 3: Test minimal event insertion
async function testMinimalEventInsert() {
  console.log('🔍 Testing minimal event insertion...');
  
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
      vendor_ids: []
    };
    
    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Minimal event insertion failed:', error);
      return false;
    }
    
    console.log('✅ Minimal event created successfully:', data.id);
    
    // Clean up
    await supabase.from('events').delete().eq('id', data.id);
    console.log('🧹 Test event cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Minimal event insertion error:', err);
    return false;
  }
}

// Test 4: Test full event insertion
async function testFullEventInsert() {
  console.log('🔍 Testing full event insertion...');
  
  try {
    const testEvent = {
      title: 'Debug Full Test Event',
      description: 'Testing full event creation with all fields',
      event_date: '2024-12-31',
      event_end_date: '2024-12-31',
      event_time: '18:00',
      event_end_time: '22:00',
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
      no_of_stalls: 5,
      in_site_stalls: [{"id":"1","stallNo":"A1","stallSize":"Medium","stallCategory":"General","price":1000}],
      all_stalls: ['A1']
    };
    
    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Full event insertion failed:', error);
      return false;
    }
    
    console.log('✅ Full event created successfully:', data.id);
    
    // Clean up
    await supabase.from('events').delete().eq('id', data.id);
    console.log('🧹 Test event cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Full event insertion error:', err);
    return false;
  }
}

// Test 5: Check user authentication
async function checkUserAuth() {
  console.log('🔍 Checking user authentication...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ User authentication failed:', error);
      return false;
    }
    
    if (!user) {
      console.warn('⚠️ No user logged in');
      return false;
    }
    
    console.log('✅ User authenticated:', user.id);
    return true;
  } catch (err) {
    console.error('❌ User authentication error:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting CreateEvent debug tests...');
  
  const results = {
    supabaseConnection: await testSupabaseConnection(),
    eventsTable: await checkEventsTable(),
    userAuth: await checkUserAuth(),
    minimalInsert: await testMinimalEventInsert(),
    fullInsert: await testFullEventInsert()
  };
  
  console.log('📊 Test Results:', results);
  
  if (results.supabaseConnection && results.eventsTable && results.minimalInsert) {
    console.log('✅ Database and basic functionality working');
    if (!results.userAuth) {
      console.log('⚠️ User authentication issue - this may cause problems');
    }
    if (!results.fullInsert) {
      console.log('⚠️ Full event insertion issue - check missing columns');
    }
  } else {
    console.log('❌ Database or basic functionality issues detected');
  }
  
  return results;
}

// Run tests when this script is executed
runAllTests();
