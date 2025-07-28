import { supabase } from '../lib/supabase';

// Type definitions for test results
export interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message: string;
  details?: string;
}

// Test Supabase connection and database schema
export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('events').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
};

// Test Events table schema
export const testEventsTable = async () => {
  console.log('📋 Testing Events Table Schema...');
  
  try {
    // Test inserting a sample event
    const testEvent = {
      title: 'Test Event - Delete Me',
      description: 'This is a test event for schema verification',
      event_date: '2024-12-31',
      event_time: '18:00',
      venue_id: null,
      venue_name: 'Test Venue',
      city: 'Test City',
      max_capacity: 100,
      plan_type: 'Plan A',
      status: 'draft',
      attendees: 0,
      total_revenue: 0,
      created_by: null,
      vendor_ids: [],
      // Extended fields
      address_line1: '123 Test Street',
      address_landmark: 'Near Test Landmark',
      address_standard: '123 Test Street, Test City, 123456',
      area_sq_ft: 1000,
      kind_of_space: 'Community Hall',
      is_covered: true,
      pricing_per_day: 5000,
      facility_area_sq_ft: 800,
      no_of_stalls: 10,
      facility_covered: true,
      amenities: 'Parking, WiFi, Catering',
      no_of_flats: 0,
      // Google Maps fields
      latitude: 20.5937,
      longitude: 78.9629,
      formatted_address: '123 Test Street, Test City, India'
    };

    const { data, error } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single();

    if (error) {
      console.error('❌ Events table schema error:', error);
      console.log('Expected fields:', Object.keys(testEvent));
      return false;
    }

    console.log('✅ Events table schema is correct');
    console.log('📊 Inserted test event ID:', data.id);

    // Clean up test data
    await supabase.from('events').delete().eq('id', data.id);
    console.log('🧹 Test event cleaned up');

    return true;
  } catch (err) {
    console.error('❌ Events table test failed:', err);
    return false;
  }
};

// Test Exhibitors table schema
export const testExhibitorsTable = async () => {
  console.log('🏢 Testing Exhibitors Table Schema...');
  
  try {
    // Test inserting a sample exhibitor
    const testExhibitor = {
      company_name: 'Test Company - Delete Me',
      company_description: 'This is a test company for schema verification',
      established_year: '2020',
      company_size: '11-50 employees',
      website: 'https://testcompany.com',
      contact_person: 'Test Contact',
      designation: 'Manager',
      email: 'test@testcompany.com',
      phone: '+91-9876543210',
      alternate_email: 'alt@testcompany.com',
      alternate_phone: '+91-9876543211',
      category: 'Technology',
      sub_category: 'Software',
      business_type: 'Private Limited',
      gst_number: '22AAAAA0000A1Z5',
      pan_number: 'ABCDE1234F',
      address: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      booth_preference: 'Near entrance',
      booth_size: '3x3 meters',
      special_requirements: 'Power outlet, WiFi',
      previous_exhibitions: 'Tech Expo 2023',
      expected_visitors: '500-1000',
      products: ['Software A', 'Software B'],
      services: ['Consulting', 'Support'],
      target_audience: 'Small businesses',
      registration_fee: 15000,
      payment_method: 'online',
      billing_address: '123 Test Street, Mumbai',
      social_media_links: {
        linkedin: 'https://linkedin.com/testcompany',
        facebook: 'https://facebook.com/testcompany',
        twitter: 'https://twitter.com/testcompany',
        instagram: 'https://instagram.com/testcompany'
      },
      documents: {
        companyProfile: null,
        gstCertificate: null,
        panCard: null,
        productCatalog: null
      },
      status: 'registered',
      payment_status: 'pending',
      send_confirmation_email: true,
      allow_marketing_emails: false
    };

    const { data, error } = await supabase
      .from('exhibitors')
      .insert(testExhibitor)
      .select()
      .single();

    if (error) {
      console.error('❌ Exhibitors table schema error:', error);
      console.log('Expected fields:', Object.keys(testExhibitor));
      return false;
    }

    console.log('✅ Exhibitors table schema is correct');
    console.log('📊 Inserted test exhibitor ID:', data.id);

    // Clean up test data
    await supabase.from('exhibitors').delete().eq('id', data.id);
    console.log('🧹 Test exhibitor cleaned up');

    return true;
  } catch (err) {
    console.error('❌ Exhibitors table test failed:', err);
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting Supabase Integration Tests...\n');
  
  const connectionTest = await testSupabaseConnection();
  if (!connectionTest) {
    console.log('\n❌ Connection test failed. Stopping tests.');
    return;
  }
  
  console.log('\n');
  const eventsTest = await testEventsTable();
  
  console.log('\n');
  const exhibitorsTest = await testExhibitorsTable();
  
  console.log('\n📊 Test Results:');
  console.log('Connection:', connectionTest ? '✅ PASS' : '❌ FAIL');
  console.log('Events Table:', eventsTest ? '✅ PASS' : '❌ FAIL');
  console.log('Exhibitors Table:', exhibitorsTest ? '✅ PASS' : '❌ FAIL');
  
  if (connectionTest && eventsTest && exhibitorsTest) {
    console.log('\n🎉 All tests passed! Supabase integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the database schema.');
  }
};

// Export for use in components
export default {
  testSupabaseConnection,
  testEventsTable,
  testExhibitorsTable,
  runAllTests
};
