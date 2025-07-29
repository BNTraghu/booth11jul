// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Save, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Building2,
  User,
  Upload,
  X,
  Image
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useVenues } from '../hooks/useSupabaseData';

interface FormData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venueId: string;
  venueName: string;
  city: string;
  maxCapacity: number;
  planType: 'Plan A' | 'Plan B' | 'Plan C' | 'Custom';
  status: 'draft' | 'published';
  attendees: number;
  totalRevenue: number;
  // Extended Fields
  addressLine1: string;
  addressLandmark: string;
  addressStandard: string;
  areaSqFt: number;
  kindOfSpace: string;
  isCovered: boolean;
  pricingPerDay: number;
  facilityAreaSqFt: number;
  noOfStalls: number;
  facilityCovered: boolean;
  amenities: string;
  noOfFlats: number;
  // Google Maps Fields
  latitude: number;
  longitude: number;
  formattedAddress: string;
  // Image Field
  eventImage: File | null;
  eventImageUrl: string;
}

interface FormErrors {
  [key: string]: string;
}

const planTypes = [
  { value: 'Plan A', label: 'Plan A - Basic Package', description: 'Essential event setup with basic amenities' },
  { value: 'Plan B', label: 'Plan B - Standard Package', description: 'Enhanced setup with additional services' },
  { value: 'Plan C', label: 'Plan C - Premium Package', description: 'Full-service premium event experience' },
  { value: 'Custom', label: 'Custom Package', description: 'Tailored solution for specific requirements' }
];

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { venues, loading: venuesLoading } = useVenues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    venueId: '',
    venueName: '',
    city: '',
    maxCapacity: 100,
    planType: 'Plan A',
    status: 'draft',
    attendees: 0,
    totalRevenue: 0,
    // Extended Fields
    addressLine1: '',
    addressLandmark: '',
    addressStandard: '',
    areaSqFt: 0,
    kindOfSpace: '',
    isCovered: false,
    pricingPerDay: 0,
    facilityAreaSqFt: 0,
    noOfStalls: 0,
    facilityCovered: false,
    amenities: '',
    noOfFlats: 0,
    // Google Maps Fields
    latitude: 0,
    longitude: 0,
    formattedAddress: '',
    // Image Field
    eventImage: null,
    eventImageUrl: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isMapUpdating, setIsMapUpdating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        console.error('Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
        return;
      }
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API. Please check your API key and network connection.');
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 }, // Center of India
      zoom: 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    mapInstanceRef.current = map;

    // Initialize marker
    const marker = new window.google.maps.Marker({
      map: map,
      draggable: true
    });

    markerRef.current = marker;

    // Add marker drag listener
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        updateAddressFromCoordinates(position.lat(), position.lng());
      }
    });

    // Add map click listener
    map.addListener('click', (event: any) => {
      const position = event.latLng;
      if (position) {
        marker.setPosition(position);
        updateAddressFromCoordinates(position.lat(), position.lng());
      }
    });
  };

  const updateAddressFromCoordinates = (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const addressComponents = result.address_components;
        
        // Extract address components
        let streetNumber = '';
        let route = '';
        let locality = '';
        let administrativeArea = '';
        
        addressComponents.forEach((component: any) => {
          const types = component.types;
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          } else if (types.includes('route')) {
            route = component.long_name;
          } else if (types.includes('locality')) {
            locality = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            administrativeArea = component.long_name;
          }
        });

        // Update form data
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          formattedAddress: result.formatted_address,
          addressLine1: `${streetNumber} ${route}`.trim(),
          addressStandard: result.formatted_address,
          city: locality || administrativeArea
        }));
      }
    });
  };

  const updateMapFromAddress = (address: string) => {
    if (!window.google || !mapInstanceRef.current || !markerRef.current) return;

    setIsMapUpdating(true);
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, (results: any, status: any) => {
      setIsMapUpdating(false);
      
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const location = result.geometry.location;
        
        // Update map position
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(15);
        markerRef.current.setPosition(location);
        
        // Update form data with coordinates
        setFormData(prev => ({
          ...prev,
          latitude: location.lat(),
          longitude: location.lng(),
          formattedAddress: result.formatted_address
        }));
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Event title must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Date validation
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.eventDate = 'Event date cannot be in the past';
      }
    }

    // Time validation
    if (!formData.eventTime) {
      newErrors.eventTime = 'Event time is required';
    }

    // Venue validation
    if (!formData.venueId) {
      newErrors.venueId = 'Please select a venue';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Capacity validation
    if (formData.maxCapacity < 10) {
      newErrors.maxCapacity = 'Maximum capacity must be at least 10';
    }

    // Extended fields validation
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.addressStandard.trim()) {
      newErrors.addressStandard = 'Standard address format is required';
    }

    if (formData.areaSqFt <= 0) {
      newErrors.areaSqFt = 'Area must be greater than 0';
    }

    if (!formData.kindOfSpace.trim()) {
      newErrors.kindOfSpace = 'Kind of space is required';
    }

    if (formData.pricingPerDay < 0) {
      newErrors.pricingPerDay = 'Pricing per day cannot be negative';
    }

    if (formData.facilityAreaSqFt < 0) {
      newErrors.facilityAreaSqFt = 'Facility area cannot be negative';
    }

    if (formData.noOfStalls < 0) {
      newErrors.noOfStalls = 'Number of stalls cannot be negative';
    }

    if (formData.noOfFlats < 0) {
      newErrors.noOfFlats = 'Number of flats cannot be negative';
    }

    // Image validation
    if (!formData.eventImage && !formData.eventImageUrl) {
      newErrors.eventImage = 'Event image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-populate venue name and city when venue is selected
    if (field === 'venueId' && value) {
      const selectedVenue = venues.find(v => v.id === value);
      if (selectedVenue) {
        setFormData(prev => ({
          ...prev,
          venueName: selectedVenue.name,
          city: selectedVenue.location?.split(',').pop()?.trim() || '',
          maxCapacity: selectedVenue.memberCount || 100
        }));
      }
    }

    // Update map when address fields change
    if ((field === 'addressLine1' || field === 'addressStandard') && value && window.google) {
      // Debounce the geocoding to avoid too many API calls
      setTimeout(() => {
        updateMapFromAddress(value);
      }, 1000);
    }
  };

  const handleImageUpload = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, eventImage: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, eventImage: 'Image size must be less than 5MB' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      eventImage: file,
      eventImageUrl: URL.createObjectURL(file)
    }));

    // Clear error
    if (errors.eventImage) {
      setErrors(prev => ({ ...prev, eventImage: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      eventImage: null,
      eventImageUrl: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.eventImageUrl;

      // Upload image to Supabase storage if a new image is selected
      if (formData.eventImage) {
        const fileExt = formData.eventImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, formData.eventImage);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Insert event into Supabase with extended fields
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          event_date: formData.eventDate,
          event_time: formData.eventTime,
          venue_id: formData.venueId,
          venue_name: formData.venueName,
          city: formData.city,
          max_capacity: formData.maxCapacity,
          plan_type: formData.planType,
          status: formData.status,
          attendees: formData.attendees,
          total_revenue: formData.totalRevenue,
          created_by: user?.id,
          vendor_ids: [],
          // Extended fields
          address_line1: formData.addressLine1,
          address_landmark: formData.addressLandmark,
          address_standard: formData.addressStandard,
          area_sq_ft: formData.areaSqFt,
          kind_of_space: formData.kindOfSpace,
          is_covered: formData.isCovered,
          pricing_per_day: formData.pricingPerDay,
          facility_area_sq_ft: formData.facilityAreaSqFt,
          no_of_stalls: formData.noOfStalls,
          facility_covered: formData.facilityCovered,
          amenities: formData.amenities,
          no_of_flats: formData.noOfFlats,
          // Google Maps fields
          latitude: formData.latitude,
          longitude: formData.longitude,
          formatted_address: formData.formattedAddress,
          // Image field
          event_image_url: imageUrl
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Event created successfully:', data);
      
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/events');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              The event "{formData.title}" has been created and is now available in the events list.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/events')} className="w-full">
                Go to Events
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    title: '',
                    description: '',
                    eventDate: '',
                    eventTime: '',
                    venueId: '',
                    venueName: '',
                    city: '',
                    maxCapacity: 100,
                    planType: 'Plan A',
                    status: 'draft',
                    attendees: 0,
                    totalRevenue: 0,
                    addressLine1: '',
                    addressLandmark: '',
                    addressStandard: '',
                    areaSqFt: 0,
                    kindOfSpace: '',
                    isCovered: false,
                    pricingPerDay: 0,
                    facilityAreaSqFt: 0,
                    noOfStalls: 0,
                    facilityCovered: false,
                    amenities: '',
                    noOfFlats: 0,
                    latitude: 0,
                    longitude: 0,
                    formattedAddress: '',
                    eventImage: null,
                    eventImageUrl: ''
                  });
                }}
                className="w-full"
              >
                Create Another Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/events')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Events</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-600">Plan and organize a new event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Event Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe your event..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.eventDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.eventDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.eventDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => handleInputChange('eventTime', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.eventTime ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.eventTime && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.eventTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Event Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Image *
                  </label>
                  <div className="space-y-4">
                    {formData.eventImageUrl ? (
                      <div className="relative">
                        <img
                          src={formData.eventImageUrl}
                          alt="Event preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="event-image-upload"
                        />
                        <label
                          htmlFor="event-image-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload event image
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                    {errors.eventImage && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.eventImage}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue & Location */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Venue & Location
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Venue *
                  </label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => handleInputChange('venueId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.venueId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={venuesLoading}
                  >
                    <option value="">
                      {venuesLoading ? 'Loading venues...' : 'Select a venue'}
                    </option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} - {venue.location} (Capacity: {venue.memberCount})
                      </option>
                    ))}
                  </select>
                  {errors.venueId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.venueId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={formData.venueName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Auto-filled when venue is selected"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter city"
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extended Event Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Extended Event Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Flat/Lane/Building..."
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.addressLandmark}
                    onChange={(e) => handleInputChange('addressLandmark', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Near hospital/mall etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Address Format *
                  </label>
                  <input
                    type="text"
                    value={formData.addressStandard}
                    onChange={(e) => handleInputChange('addressStandard', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.addressStandard ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="123, Street, City, PIN"
                  />
                  {errors.addressStandard && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.addressStandard}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Google Maps)
                  </label>
                  <div className="space-y-4">
                    <div className="w-full h-64 border rounded-lg overflow-hidden relative" ref={mapRef}>
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        Loading map...
                      </div>
                      {isMapUpdating && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Updating map...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>• Click on the map to set the location</p>
                      <p>• Drag the marker to adjust the position</p>
                      <p>• Address will be automatically filled based on the selected location</p>
                    </div>
                    {formData.latitude !== 0 && formData.longitude !== 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Selected Location:</strong> {formData.formattedAddress}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (sq ft) *
                    </label>
                    <input
                      type="number"
                      value={formData.areaSqFt}
                      onChange={(e) => handleInputChange('areaSqFt', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.areaSqFt ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter area in sq ft"
                    />
                    {errors.areaSqFt && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.areaSqFt}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kind of Space *
                    </label>
                    <input
                      type="text"
                      value={formData.kindOfSpace}
                      onChange={(e) => handleInputChange('kindOfSpace', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.kindOfSpace ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Community Hall, Parking etc."
                    />
                    {errors.kindOfSpace && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.kindOfSpace}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isCovered}
                        onChange={(e) => handleInputChange('isCovered', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Covered Space</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pricing Per Day
                    </label>
                    <input
                      type="number"
                      value={formData.pricingPerDay}
                      onChange={(e) => handleInputChange('pricingPerDay', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.pricingPerDay ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter pricing per day"
                    />
                    {errors.pricingPerDay && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.pricingPerDay}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facility Area (sq ft)
                    </label>
                    <input
                      type="number"
                      value={formData.facilityAreaSqFt}
                      onChange={(e) => handleInputChange('facilityAreaSqFt', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.facilityAreaSqFt ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter facility area"
                    />
                    {errors.facilityAreaSqFt && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.facilityAreaSqFt}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. of Stalls
                    </label>
                    <input
                      type="number"
                      value={formData.noOfStalls}
                      onChange={(e) => handleInputChange('noOfStalls', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.noOfStalls ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter number of stalls"
                    />
                    {errors.noOfStalls && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.noOfStalls}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.facilityCovered}
                        onChange={(e) => handleInputChange('facilityCovered', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Facility Covered</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <input
                      type="text"
                      value={formData.amenities}
                      onChange={(e) => handleInputChange('amenities', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter available amenities"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. of Flats
                    </label>
                    <input
                      type="number"
                      value={formData.noOfFlats}
                      onChange={(e) => handleInputChange('noOfFlats', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.noOfFlats ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter number of flats"
                    />
                    {errors.noOfFlats && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.noOfFlats}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Configuration */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Event Configuration
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Capacity *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.maxCapacity ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Maximum attendees"
                        min="10"
                      />
                    </div>
                    {errors.maxCapacity && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.maxCapacity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planTypes.map((plan) => (
                      <label key={plan.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="planType"
                          value={plan.value}
                          checked={formData.planType === plan.value}
                          onChange={(e) => handleInputChange('planType', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg transition-colors duration-200 ${
                          formData.planType === plan.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="font-medium text-gray-900">{plan.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{plan.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Event Summary</h3>
              </CardHeader>
              <CardContent>
                {/* Event Image Preview */}
                {formData.eventImageUrl && (
                  <div className="mb-4">
                    <img
                      src={formData.eventImageUrl}
                      alt="Event preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formData.maxCapacity > 0 ? formData.maxCapacity.toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Maximum Capacity</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {formData.eventDate ? new Date(formData.eventDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formData.eventTime || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue:</span>
                      <span className="font-medium truncate">{formData.venueName || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{formData.city || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{formData.planType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={formData.status === 'published' ? 'success' : 'warning'}>
                        {formData.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{formData.areaSqFt > 0 ? `${formData.areaSqFt} sq ft` : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pricing:</span>
                      <span className="font-medium">{formData.pricingPerDay > 0 ? `₹${formData.pricingPerDay}/day` : 'Not set'}</span>
                    </div>
                    {formData.latitude !== 0 && formData.longitude !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-green-600">✓ Set</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Guidelines
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Choose a descriptive title that clearly identifies your event</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Select an appropriate venue based on expected attendance</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Set realistic capacity limits for safety and comfort</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Provide accurate venue details and amenities</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Use draft status for planning, publish when ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting || venuesLoading}
                className="w-full flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Event...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Event</span>
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
