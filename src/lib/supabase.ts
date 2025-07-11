import { createClient } from '@supabase/supabase-js';

// Fallback values for development if env vars are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE1MjU1MCwiZXhwIjoxOTMxNzI4NTUwfQ.eUGq3kQQZkf1XjmRNVA5a_Vo3Je4g_LQDk5zCwCEq7I';

// Log connection info for debugging
console.log('Connecting to Supabase:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
});

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Test connection and log result
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count()', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
  }
}

// Run the test
testConnection();

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          city: string | null;
          phone: string | null;
          status: string;
          created_at: string;
          last_login: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: string;
          city?: string | null;
          phone?: string | null;
          status?: string;
          created_at?: string;
          last_login?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          city?: string | null;
          phone?: string | null;
          status?: string;
          created_at?: string;
          last_login?: string | null;
          updated_at?: string;
        };
      };
      venues: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          capacity: number | null;
          facilities: string[] | null;
          active_events: number | null;
          total_revenue: number | null;
          status: string;
          joined_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          capacity?: number | null;
          facilities?: string[] | null;
          active_events?: number | null;
          total_revenue?: number | null;
          status?: string;
          joined_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          capacity?: number | null;
          facilities?: string[] | null;
          active_events?: number | null;
          total_revenue?: number | null;
          status?: string;
          joined_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string | null;
          event_time: string | null;
          venue_name: string | null;
          city: string | null;
          status: string;
          attendees: number | null;
          max_capacity: number | null;
          plan_type: string | null;
          vendor_ids: string[] | null;
          venue_id: string | null;
          created_by: string | null;
          total_revenue: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          venue_name?: string | null;
          city?: string | null;
          status?: string;
          attendees?: number | null;
          max_capacity?: number | null;
          plan_type?: string | null;
          vendor_ids?: string[] | null;
          venue_id?: string | null;
          created_by?: string | null;
          total_revenue?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          venue_name?: string | null;
          city?: string | null;
          status?: string;
          attendees?: number | null;
          max_capacity?: number | null;
          plan_type?: string | null;
          vendor_ids?: string[] | null;
          venue_id?: string | null;
          created_by?: string | null;
          total_revenue?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          category: string;
          city: string | null;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          rating: number | null;
          completed_jobs: number | null;
          status: string;
          price_range: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          city?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          rating?: number | null;
          completed_jobs?: number | null;
          status?: string;
          price_range?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          city?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          rating?: number | null;
          completed_jobs?: number | null;
          status?: string;
          price_range?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exhibitors: {
        Row: {
          id: string;
          company_name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          category: string | null;
          city: string | null;
          booth: string | null;
          registration_date: string | null;
          status: string;
          payment_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          category?: string | null;
          city?: string | null;
          booth?: string | null;
          registration_date?: string | null;
          status?: string;
          payment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          category?: string | null;
          city?: string | null;
          booth?: string | null;
          registration_date?: string | null;
          status?: string;
          payment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}