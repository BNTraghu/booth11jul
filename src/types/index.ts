export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  city?: string | null;
  phone?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string | null;
  updated_at: string;
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'support_tech'
  | 'sales_marketing'
  | 'legal'
  | 'logistics'
  | 'accounting'
  | 'vendor'
  | 'society'
  | 'exhibitor';

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  date: string; // event_date from DB
  eventEndDate?: string | null; // event_end_date from DB
  time: string; // event_time from DB
  eventEndTime?: string | null; // event_end_time from DB
  venue: string; // venue_name from DB
  city?: string | null;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  attendees: number;
  maxCapacity: number; // max_capacity from DB
  planType?: 'Plan A' | 'Plan B' | 'Plan C' | 'Custom' | null; // plan_type from DB
  vendors: string[]; // vendor_ids from DB
  venueId?: string | null; // venue_id from DB
  createdBy?: string | null; // created_by from DB
  totalRevenue: number; // total_revenue from DB
  eventImageUrl?: string | null; // event_image_url from DB
  // Pricing & Availability
  pricePerHour?: number | null; // price_per_hour from DB
  availableHours?: string | null; // available_hours from DB
  parkingSpaces?: number | null; // parking_spaces from DB
  cateringAllowed?: boolean | null; // catering_allowed from DB
  alcoholAllowed?: boolean | null; // alcohol_allowed from DB
  smokingAllowed?: boolean | null; // smoking_allowed from DB
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  location?: string | null;
  contactPerson?: string | null; // contact_person from DB
  email?: string | null;
  phone?: string | null;
  memberCount: number; // capacity from DB
  facilities: string[];
  amenities: string[];
  activeEvents: number; // active_events from DB
  totalRevenue: number; // total_revenue from DB
  status: 'active' | 'inactive' | 'pending';
  joinedDate?: string | null; // joined_date from DB
  // Extended fields
  addressLine1?: string | null; // address_line1 from DB
  addressLandmark?: string | null; // address_landmark from DB
  addressStandard?: string | null; // address_standard from DB
  areaSqFt?: number | null; // area_sq_ft from DB
  kindOfSpace?: string | null; // kind_of_space from DB
  isCovered?: boolean | null; // is_covered from DB
  pricingPerDay?: number | null; // pricing_per_day from DB
  facilityAreaSqFt?: number | null; // facility_area_sq_ft from DB
  noOfStalls?: number | null; // no_of_stalls from DB
  facilityCovered?: boolean | null; // facility_covered from DB
  noOfFlats?: number | null; // no_of_flats from DB
  availableHours?: string | null; // available_hours from DB
  parkingSpaces?: number | null; // parking_spaces from DB
  cateringAllowed?: boolean | null; // catering_allowed from DB
  alcoholAllowed?: boolean | null; // alcohol_allowed from DB
  smokingAllowed?: boolean | null; // smoking_allowed from DB
  // Google Maps fields
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null; // formatted_address from DB
  description?: string | null;
  // Custom Contact Information
  customContacts?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  }> | null; // custom_contacts from DB
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'sound_lights' | 'catering' | 'decoration' | 'security' | 'transportation' | 'housekeeping';
  city?: string | null;
  contactPerson?: string | null; // contact_person from DB
  email?: string | null;
  phone?: string | null;
  rating?: number | null;
  completedJobs: number; // completed_jobs from DB
  status: 'active' | 'inactive';
  priceRange?: string | null; // price_range from DB
  created_at: string;
  updated_at: string;
}

export interface Exhibitor {
  id: string;
  companyName: string; // company_name from DB
  contactPerson?: string | null; // contact_person from DB
  email?: string | null;
  phone?: string | null;
  category?: string | null;
  city?: string | null;
  booth?: string | null;
  registrationDate?: string | null; // registration_date from DB
  status: 'registered' | 'confirmed' | 'checked_in' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded'; // payment_status from DB
  created_at: string;
  updated_at: string;
}

export interface Society {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  memberCount: number;
  facilities: string[];
  activeEvents: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalVenues: number;
  totalVendors: number;
  totalExhibitors: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
}