// Fix Authentication Issues
// Run this in browser console to fix the refresh token error

console.log('🔧 Fixing authentication issues...');

// Step 1: Clear all stored tokens
function clearTokens() {
  console.log('🧹 Clearing stored tokens...');
  
  // Clear localStorage
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.refreshToken');
  localStorage.removeItem('user');
  
  // Clear sessionStorage
  sessionStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.refreshToken');
  
  console.log('✅ Tokens cleared');
}

// Step 2: Sign out from Supabase
async function signOut() {
  console.log('🚪 Signing out from Supabase...');
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
    } else {
      console.log('✅ Signed out successfully');
    }
  } catch (err) {
    console.error('❌ Sign out exception:', err);
  }
}

// Step 3: Check current auth state
async function checkAuthState() {
  console.log('🔍 Checking current auth state...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session check error:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ User is authenticated:', session.user.email);
      return true;
    } else {
      console.log('⚠️ No active session');
      return false;
    }
  } catch (err) {
    console.error('❌ Auth state check error:', err);
    return false;
  }
}

// Step 4: Test event creation without auth
async function testEventWithoutAuth() {
  console.log('🧪 Testing event creation without auth...');
  
  try {
    const testEvent = {
      title: 'Test Event No Auth',
      description: 'Testing without authentication',
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
    
    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Event creation failed:', error);
      return false;
    }
    
    console.log('✅ Event created without auth:', data.id);
    
    // Clean up
    await supabase.from('events').delete().eq('id', data.id);
    console.log('🧹 Test event cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Event creation error:', err);
    return false;
  }
}

// Step 5: Provide login instructions
function provideLoginInstructions() {
  console.log('📋 Login Instructions:');
  console.log('1. Go to the Login page');
  console.log('2. Enter your email and password');
  console.log('3. Click Login');
  console.log('4. Try creating an event again');
}

// Run the fix
async function runAuthFix() {
  console.log('🚀 Starting authentication fix...');
  
  // Clear tokens
  clearTokens();
  
  // Sign out
  await signOut();
  
  // Check auth state
  const isAuthenticated = await checkAuthState();
  
  // Test event creation
  const eventCreated = await testEventWithoutAuth();
  
  console.log('📊 Fix Results:', {
    isAuthenticated,
    eventCreated
  });
  
  if (eventCreated) {
    console.log('✅ Event creation works without authentication');
    console.log('💡 You can create events without being logged in');
  } else {
    console.log('❌ Event creation still fails');
    console.log('💡 This might be a database permission issue');
  }
  
  if (!isAuthenticated) {
    provideLoginInstructions();
  }
  
  return { isAuthenticated, eventCreated };
}

// Auto-run the fix
runAuthFix();

// Export for manual testing
window.fixAuth = runAuthFix;
