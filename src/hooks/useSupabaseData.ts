import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Event, Venue, Vendor, Exhibitor } from '../types';

// Generic hook for fetching data from Supabase
export function useSupabaseData<T>(
  table: string,
  select: string = '*',
  dependencies: any[] = [],
  options: { limit?: number; order?: { column: string; ascending?: boolean } } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from(table)
        .select(select);
      
      // Add ordering if specified
      if (options.order) {
        query = query.order(
          options.order.column, 
          { ascending: options.order.ascending ?? false }
        );
      }
      
      // Add limit if specified
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Execute the query
      const { data: result, error } = await query;

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        setError(error.message);
      } else {
        setData(result as T[] || []);
        setError(null);
      }
    } catch (err) {
      console.error(`Unexpected error fetching ${table}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [...dependencies]);

  return { data, loading, error, refetch: () => fetchData() };
}

// Specific hooks for each entity
export const useUsers = () => {
  const { data, loading, error, refetch } = useSupabaseData<any>('users');
  
  // Transform data to match our enhanced User interface
  const users: User[] = data.map((user: any) => {
    const transformedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      city: user.city,
      phone: user.phone,
      status: user.status,
      // Additional fields
      firstName: user.first_name,
      lastName: user.last_name,
      address: user.address,
      state: user.state,
      pincode: user.pincode,
      country: user.country,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      department: user.department,
      designation: user.designation,
      employeeId: user.employee_id,
      joiningDate: user.joining_date,
      emergencyContact: user.emergency_contact,
      preferences: user.preferences,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    return transformedUser;
  });

  return { users, loading, error, refetch };
};

export const useEvents = () => {
  const { data, loading, error, refetch } = useSupabaseData<any>('events', `
    *,
    venue:venues(name)
  `, [], { order: { column: 'created_at', ascending: false }, limit: 50 });
  
  // Transform data to match our Event interface
  const events: Event[] = data.map((event: any) => {
    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.event_date,
      eventEndDate: event.event_end_date,
      time: event.event_time,
      eventEndTime: event.event_end_time,
      venue: event.venue_name || event.venue?.name || '',
      city: event.city,
      status: event.status,
      attendees: event.attendees || 0,
      maxCapacity: event.max_capacity || 0,
      planType: event.plan_type,
      vendors: event.vendor_ids || [],
      venueId: event.venue_id,
      createdBy: event.created_by,
      totalRevenue: event.total_revenue || 0,
      eventImageUrl: event.event_image_url,
      // Pricing & Availability
      pricePerHour: event.price_per_hour,
      availableHours: event.available_hours,
      parkingSpaces: event.parking_spaces,
      cateringAllowed: event.catering_allowed,
      alcoholAllowed: event.alcohol_allowed,
      smokingAllowed: event.smoking_allowed,
      created_at: event.created_at,
      updated_at: event.updated_at
    };
    
    return transformedEvent;
  });

  return { events, loading, error, refetch };
};

export const useVenues = () => {
  const { data, loading, error, refetch } = useSupabaseData<any>('venues', '*', [], 
    { order: { column: 'name', ascending: true } });
  
  // Transform data to match our Venue interface
  const venues: Venue[] = data.map((venue: any) => {
    const transformedVenue = {
      id: venue.id,
      name: venue.name,
      location: venue.location,
      contactPerson: venue.contact_person,
      email: venue.email,
      phone: venue.phone,
      memberCount: venue.capacity || 0,
      facilities: venue.facilities || [],
      amenities: venue.amenities || [],
      activeEvents: venue.active_events || 0,
      totalRevenue: venue.total_revenue || 0,
      status: venue.status,
      joinedDate: venue.joined_date,
      // Extended fields
      addressLine1: venue.address_line1,
      addressLandmark: venue.address_landmark,
      addressStandard: venue.address_standard,
      areaSqFt: venue.area_sq_ft,
      kindOfSpace: venue.kind_of_space,
      isCovered: venue.is_covered,
      pricingPerDay: venue.pricing_per_day,
      facilityAreaSqFt: venue.facility_area_sq_ft,
      noOfStalls: venue.no_of_stalls,
      facilityCovered: venue.facility_covered,
      noOfFlats: venue.no_of_flats,
      availableHours: venue.available_hours,
      parkingSpaces: venue.parking_spaces,
      cateringAllowed: venue.catering_allowed,
      alcoholAllowed: venue.alcohol_allowed,
      smokingAllowed: venue.smoking_allowed,
      // Google Maps fields
      latitude: venue.latitude,
      longitude: venue.longitude,
      formattedAddress: venue.formatted_address,
      description: venue.description,
      // Custom Contact Information
      customContacts: venue.custom_contacts || [],
      // Timestamps
      created_at: venue.created_at,
      updated_at: venue.updated_at
    };
    
    return transformedVenue;
  });

  return { venues, loading, error, refetch };
};

export const useVendors = () => {
  const { data, loading, error, refetch } = useSupabaseData<any>('vendors', '*', [],
    { order: { column: 'name', ascending: true } });
  
  // Transform data to match our Vendor interface
  const vendors: Vendor[] = data.map((vendor: any) => ({
    id: vendor.id,
    name: vendor.name,
    category: vendor.category,
    city: vendor.city,
    contactPerson: vendor.contact_person,
    email: vendor.email,
    phone: vendor.phone,
    rating: vendor.rating,
    completedJobs: vendor.completed_jobs || 0,
    status: vendor.status,
    priceRange: vendor.price_range,
    created_at: vendor.created_at,
    updated_at: vendor.updated_at
  }));

  return { vendors, loading, error, refetch };
};

export const useExhibitors = () => {
  const { data, loading, error, refetch } = useSupabaseData<any>('exhibitors', '*', [],
    { order: { column: 'created_at', ascending: false } });
  
  // Transform data to match our Exhibitor interface
  const exhibitors: Exhibitor[] = data.map((exhibitor: any) => ({
    id: exhibitor.id,
    // Company Information
    companyName: exhibitor.company_name,
    companyDescription: exhibitor.company_description,
    establishedYear: exhibitor.established_year,
    companySize: exhibitor.company_size,
    website: exhibitor.website,
    
    // Contact Information
    contactPerson: exhibitor.contact_person,
    designation: exhibitor.designation,
    email: exhibitor.email,
    phone: exhibitor.phone,
    alternatePhone: exhibitor.alternate_phone,
    alternateEmail: exhibitor.alternate_email,
    
    // Business Details
    category: exhibitor.category,
    subCategory: exhibitor.sub_category,
    businessType: exhibitor.business_type,
    gstNumber: exhibitor.gst_number,
    panNumber: exhibitor.pan_number,
    
    // Location & Address
    address: exhibitor.address,
    city: exhibitor.city,
    state: exhibitor.state,
    pincode: exhibitor.pincode,
    country: exhibitor.country,
    
    // Exhibition Details
    boothPreference: exhibitor.booth_preference,
    boothSize: exhibitor.booth_size,
    specialRequirements: exhibitor.special_requirements,
    previousExhibitions: exhibitor.previous_exhibitions,
    expectedVisitors: exhibitor.expected_visitors,
    
    // Products & Services
    products: exhibitor.products || [],
    services: exhibitor.services || [],
    targetAudience: exhibitor.target_audience,
    
    // Payment & Billing
    registrationFee: exhibitor.registration_fee,
    paymentMethod: exhibitor.payment_method,
    billingAddress: exhibitor.billing_address,
    
    // Additional Information
    socialMediaLinks: exhibitor.social_media_links || {
      linkedin: '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    
    // Settings
    status: exhibitor.status,
    paymentStatus: exhibitor.payment_status,
    sendConfirmationEmail: exhibitor.send_confirmation_email,
    allowMarketingEmails: exhibitor.allow_marketing_emails,
    
    // Legacy fields
    booth: exhibitor.booth,
    registrationDate: exhibitor.registration_date,
    
    // Timestamps
    created_at: exhibitor.created_at,
    updated_at: exhibitor.updated_at
  }));

  return { exhibitors, loading, error, refetch };
};