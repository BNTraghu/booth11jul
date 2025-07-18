// Simple script to test Supabase connection
// Run with: node src/utils/testConnection.js
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL //|| 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY //|| 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE1MjU1MCwiZXhwIjoxOTMxNzI4NTUwfQ.eUGq3kQQZkf1XjmRNVA5a_Vo3Je4g_LQDk5zCwCEq7I';

console.log('Testing Supabase connection with:');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey.length);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
async function testConnection() {
  try {
    console.log('Attempting to connect to Supabase...');
    
    // Try a simple query
    const { data, error } = await supabase.from('users').select('count()', { count: 'exact', head: true });
    if (error) {
      console.error('Connection failed:', error);
    } else {
      console.log('Connection successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
testConnection();

// Export the test function for potential reuse
