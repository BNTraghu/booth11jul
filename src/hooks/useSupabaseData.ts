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
  const { data, loading, error, refetch } = useSupabaseData<User>('users');
  return { users: data, loading, error, refetch };
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
    companyName: exhibitor.company_name,
    contactPerson: exhibitor.contact_person,
    email: exhibitor.email,
    phone: exhibitor.phone,
    category: exhibitor.category,
    city: exhibitor.city,
    booth: exhibitor.booth,
    registrationDate: exhibitor.registration_date,
    status: exhibitor.status,
    paymentStatus: exhibitor.payment_status,
    created_at: exhibitor.created_at,
    updated_at: exhibitor.updated_at
  }));

  return { exhibitors, loading, error, refetch };
};