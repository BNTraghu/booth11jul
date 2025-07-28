# Database Schema Documentation

## Overview
This document outlines the complete database schema for the Event Management System, including all tables, fields, data types, and relationships.

## Tables

### 1. Events Table

**Table Name:** `events`

**Description:** Stores all event information including basic details, extended venue information, and Google Maps coordinates.

#### Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | `uuid` | ✅ | Primary key, auto-generated |
| `title` | `text` | ✅ | Event title |
| `description` | `text` | ❌ | Event description |
| `event_date` | `date` | ✅ | Event date (YYYY-MM-DD) |
| `event_time` | `time` | ✅ | Event time (HH:MM) |
| `venue_id` | `uuid` | ❌ | Foreign key to venues table |
| `venue_name` | `text` | ❌ | Venue name (auto-filled) |
| `city` | `text` | ✅ | Event city |
| `max_capacity` | `integer` | ✅ | Maximum attendees |
| `plan_type` | `text` | ❌ | Plan type (Plan A, Plan B, Plan C, Custom) |
| `status` | `text` | ✅ | Event status (draft, published, ongoing, completed, cancelled) |
| `attendees` | `integer` | ❌ | Current attendees count |
| `total_revenue` | `numeric` | ❌ | Total revenue generated |
| `created_by` | `uuid` | ❌ | Foreign key to users table |
| `vendor_ids` | `jsonb` | ❌ | Array of vendor IDs |
| `created_at` | `timestamp` | ✅ | Auto-generated timestamp |
| `updated_at` | `timestamp` | ✅ | Auto-updated timestamp |

#### Extended Fields (New)

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `address_line1` | `text` | ✅ | Street address |
| `address_landmark` | `text` | ❌ | Nearby landmark |
| `address_standard` | `text` | ✅ | Standardized address format |
| `area_sq_ft` | `integer` | ✅ | Venue area in square feet |
| `kind_of_space` | `text` | ✅ | Type of space (Community Hall, Parking, etc.) |
| `is_covered` | `boolean` | ❌ | Whether space is covered |
| `pricing_per_day` | `numeric` | ❌ | Daily pricing |
| `facility_area_sq_ft` | `integer` | ❌ | Facility area in square feet |
| `no_of_stalls` | `integer` | ❌ | Number of available stalls |
| `facility_covered` | `boolean` | ❌ | Whether facility is covered |
| `amenities` | `text` | ❌ | Available amenities |
| `no_of_flats` | `integer` | ❌ | Number of flats |

#### Google Maps Fields (New)

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `latitude` | `numeric` | ❌ | Latitude coordinate |
| `longitude` | `numeric` | ❌ | Longitude coordinate |
| `formatted_address` | `text` | ❌ | Google Maps formatted address |

### 2. Exhibitors Table

**Table Name:** `exhibitors`

**Description:** Stores comprehensive exhibitor information including company details, contact information, and exhibition preferences.

#### Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | `uuid` | ✅ | Primary key, auto-generated |
| `company_name` | `text` | ✅ | Company name |
| `company_description` | `text` | ✅ | Company description |
| `established_year` | `text` | ❌ | Year company was established |
| `company_size` | `text` | ❌ | Company size (1-10 employees, etc.) |
| `website` | `text` | ❌ | Company website URL |
| `contact_person` | `text` | ✅ | Primary contact person |
| `designation` | `text` | ✅ | Contact person's designation |
| `email` | `text` | ✅ | Primary email address |
| `phone` | `text` | ✅ | Primary phone number |
| `alternate_email` | `text` | ❌ | Alternate email address |
| `alternate_phone` | `text` | ❌ | Alternate phone number |
| `category` | `text` | ✅ | Business category |
| `sub_category` | `text` | ❌ | Business sub-category |
| `business_type` | `text` | ✅ | Type of business entity |
| `gst_number` | `text` | ❌ | GST registration number |
| `pan_number` | `text` | ❌ | PAN card number |
| `address` | `text` | ✅ | Company address |
| `city` | `text` | ✅ | Company city |
| `state` | `text` | ✅ | Company state |
| `pincode` | `text` | ✅ | Postal code |
| `country` | `text` | ❌ | Country (default: India) |
| `booth_preference` | `text` | ❌ | Booth location preference |
| `booth_size` | `text` | ✅ | Required booth size |
| `special_requirements` | `text` | ❌ | Special setup requirements |
| `previous_exhibitions` | `text` | ❌ | Previous exhibition experience |
| `expected_visitors` | `text` | ✅ | Expected visitor count |
| `products` | `jsonb` | ❌ | Array of product names |
| `services` | `jsonb` | ❌ | Array of service names |
| `target_audience` | `text` | ❌ | Target audience description |
| `registration_fee` | `numeric` | ❌ | Registration fee amount |
| `payment_method` | `text` | ❌ | Preferred payment method |
| `billing_address` | `text` | ❌ | Billing address |
| `social_media_links` | `jsonb` | ❌ | Social media URLs |
| `documents` | `jsonb` | ❌ | Document references |
| `status` | `text` | ✅ | Registration status |
| `payment_status` | `text` | ✅ | Payment status |
| `send_confirmation_email` | `boolean` | ❌ | Email confirmation preference |
| `allow_marketing_emails` | `boolean` | ❌ | Marketing email preference |
| `created_at` | `timestamp` | ✅ | Auto-generated timestamp |
| `updated_at` | `timestamp` | ✅ | Auto-updated timestamp |

### 3. Users Table

**Table Name:** `users`

**Description:** Stores user account information and roles.

#### Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | `uuid` | ✅ | Primary key |
| `email` | `text` | ✅ | User email |
| `name` | `text` | ✅ | User full name |
| `role` | `text` | ✅ | User role |
| `city` | `text` | ❌ | User city |
| `phone` | `text` | ❌ | User phone |
| `status` | `text` | ✅ | Account status |
| `created_at` | `timestamp` | ✅ | Account creation date |
| `last_login` | `timestamp` | ❌ | Last login timestamp |
| `updated_at` | `timestamp` | ✅ | Last update timestamp |

### 4. Venues Table

**Table Name:** `venues`

**Description:** Stores venue information for events.

#### Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | `uuid` | ✅ | Primary key |
| `name` | `text` | ✅ | Venue name |
| `location` | `text` | ❌ | Venue location |
| `contact_person` | `text` | ❌ | Venue contact person |
| `email` | `text` | ❌ | Venue email |
| `phone` | `text` | ❌ | Venue phone |
| `capacity` | `integer` | ❌ | Venue capacity |
| `facilities` | `jsonb` | ❌ | Available facilities |
| `active_events` | `integer` | ❌ | Number of active events |
| `total_revenue` | `numeric` | ❌ | Total revenue generated |
| `status` | `text` | ✅ | Venue status |
| `joined_date` | `date` | ❌ | Venue registration date |
| `created_at` | `timestamp` | ✅ | Creation timestamp |
| `updated_at` | `timestamp` | ✅ | Update timestamp |

### 5. Vendors Table

**Table Name:** `vendors`

**Description:** Stores vendor information for event services.

#### Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | `uuid` | ✅ | Primary key |
| `name` | `text` | ✅ | Vendor name |
| `category` | `text` | ✅ | Service category |
| `city` | `text` | ❌ | Vendor city |
| `contact_person` | `text` | ❌ | Contact person |
| `email` | `text` | ❌ | Vendor email |
| `phone` | `text` | ❌ | Vendor phone |
| `rating` | `numeric` | ❌ | Vendor rating |
| `completed_jobs` | `integer` | ❌ | Number of completed jobs |
| `status` | `text` | ✅ | Vendor status |
| `price_range` | `text` | ❌ | Price range |
| `created_at` | `timestamp` | ✅ | Creation timestamp |
| `updated_at` | `timestamp` | ✅ | Update timestamp |

## Relationships

### Foreign Key Relationships

1. **Events → Users**
   - `events.created_by` → `users.id`

2. **Events → Venues**
   - `events.venue_id` → `venues.id`

3. **Events → Vendors** (Many-to-Many)
   - `events.vendor_ids` contains array of vendor IDs

## Data Types

### Enums

**Event Status:**
- `draft`
- `published`
- `ongoing`
- `completed`
- `cancelled`

**Plan Types:**
- `Plan A`
- `Plan B`
- `Plan C`
- `Custom`

**Exhibitor Status:**
- `registered`
- `confirmed`
- `checked_in`
- `cancelled`

**Payment Status:**
- `pending`
- `paid`
- `refunded`

**User Roles:**
- `super_admin`
- `admin`
- `support_tech`
- `sales_marketing`
- `legal`
- `logistics`
- `accounting`
- `vendor`
- `society`
- `exhibitor`

## Indexes

### Recommended Indexes

```sql
-- Events table indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_created_by ON events(created_by);

-- Exhibitors table indexes
CREATE INDEX idx_exhibitors_status ON exhibitors(status);
CREATE INDEX idx_exhibitors_category ON exhibitors(category);
CREATE INDEX idx_exhibitors_city ON exhibitors(city);
CREATE INDEX idx_exhibitors_payment_status ON exhibitors(payment_status);

-- Users table indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Venues table indexes
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_city ON venues(location);
```

## Validation Rules

### Events Table
- `max_capacity` must be > 0
- `event_date` must be in the future
- `area_sq_ft` must be > 0
- `pricing_per_day` must be >= 0

### Exhibitors Table
- `email` must be valid email format
- `phone` must be valid phone format
- `registration_fee` must be >= 0
- `established_year` must be between 1900 and current year

## Security Policies

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );
```

## Testing

Use the provided test utilities in `src/utils/testConnection.js` to verify:

1. **Connection Test:** Basic Supabase connectivity
2. **Schema Test:** Verify all required fields exist
3. **Insert Test:** Test data insertion and retrieval
4. **Cleanup Test:** Verify test data cleanup

Run tests with:
```javascript
import { runAllTests } from '../utils/testConnection';
runAllTests();
```

## Migration Notes

### Recent Changes (v2.0)

1. **Added Extended Fields to Events:**
   - Address and venue details
   - Facility specifications
   - Pricing information

2. **Added Google Maps Integration:**
   - Latitude/longitude coordinates
   - Formatted address storage

3. **Enhanced Exhibitors Schema:**
   - Comprehensive company information
   - Social media links
   - Document management
   - Marketing preferences

### Migration Scripts

```sql
-- Add extended fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS address_landmark text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS address_standard text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS area_sq_ft integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS kind_of_space text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_covered boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS pricing_per_day numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS facility_area_sq_ft integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS no_of_stalls integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS facility_covered boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS amenities text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS no_of_flats integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS formatted_address text;

-- Add constraints
ALTER TABLE events ADD CONSTRAINT check_area_sq_ft CHECK (area_sq_ft > 0);
ALTER TABLE events ADD CONSTRAINT check_pricing_per_day CHECK (pricing_per_day >= 0);
``` 