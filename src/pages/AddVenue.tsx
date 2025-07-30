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
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

interface FormData {
  name: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  memberCount: number;
  facilities: string[];
  amenities: string[];
  description: string;
  status: 'active' | 'inactive' | 'pending';
  pricePerHour: number;
  availableHours: string;
  parkingSpaces: number;
  cateringAllowed: boolean;
  alcoholAllowed: boolean;
  smokingAllowed: boolean;
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
  noOfFlats: number;
  // Google Maps Fields
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface FormErrors {
  [key: string]: string;
}

const defaultFacilities = [
  'Auditorium',
  'Community Hall',
  'Garden Area',
  'Parking',
  'Sound System',
  'Projector',
  'Air Conditioning',
  'Kitchen',
  'Restrooms',
  'Stage',
  'Dance Floor',
  'Outdoor Space'
];

const defaultAmenities = [
  'Wi-Fi',
  'Power Outlets',
  'Lighting',
  'Heating',
  'Cooling',
  'Security',
  'Catering Kitchen',
  'Storage Space',
  'Loading Dock',
  'Accessibility',
  'First Aid',
  'Fire Safety'
];

export const AddVenue: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    contactPerson: '',
    email: '',
    phone: '',
    memberCount: 0,
    facilities: [],
    amenities: [],
    description: '',
    status: 'active',
    pricePerHour: 0,
    availableHours: '9:00 AM - 11:00 PM',
    parkingSpaces: 0,
    cateringAllowed: true,
    alcoholAllowed: false,
    smokingAllowed: false,
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
    noOfFlats: 0,
    // Google Maps Fields
    latitude: 0,
    longitude: 0,
    formattedAddress: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [customFacility, setCustomFacility] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');
  const [isMapUpdating, setIsMapUpdating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
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
          location: result.formatted_address
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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Venue name must be at least 3 characters';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Contact person validation
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Capacity validation
    if (formData.memberCount <= 0) {
      newErrors.memberCount = 'Capacity must be greater than 0';
    }

    // Price validation
    if (formData.pricePerHour < 0) {
      newErrors.pricePerHour = 'Price cannot be negative';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update map when address fields change
    if ((field === 'addressLine1' || field === 'addressStandard' || field === 'location') && value && window.google) {
      // Debounce the geocoding to avoid too many API calls
      setTimeout(() => {
        updateMapFromAddress(value);
      }, 1000);
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleAddCustomFacility = () => {
    if (customFacility.trim() && !formData.facilities.includes(customFacility.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, customFacility.trim()]
      }));
      setCustomFacility('');
    }
  };

  const handleRemoveCustomFacility = (facility: string) => {
    if (!defaultFacilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: prev.facilities.filter(f => f !== facility)
      }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };

  const handleRemoveCustomAmenity = (amenity: string) => {
    if (!defaultAmenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert venue into Supabase
      const { data, error } = await supabase
        .from('venues')
        .insert({
          name: formData.name,
          location: formData.location,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          capacity: formData.memberCount,
          facilities: formData.facilities,
          description: formData.description,
          status: formData.status,
          total_revenue: 0,
          active_events: 0,
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
          no_of_flats: formData.noOfFlats,
          // Google Maps fields
          latitude: formData.latitude,
          longitude: formData.longitude,
          formatted_address: formData.formattedAddress,
          // Additional fields
          available_hours: formData.availableHours,
          parking_spaces: formData.parkingSpaces,
          catering_allowed: formData.cateringAllowed,
          alcohol_allowed: formData.alcoholAllowed,
          smoking_allowed: formData.smokingAllowed
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Venue created successfully:', data);
      
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/venues');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating venue:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create venue. Please try again.';
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue Added Successfully!</h2>
            <p className="text-gray-600 mb-6">
              The venue "{formData.name}" has been added to the system and is now available for event bookings.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/venues')} className="w-full">
                Go to Venue Management
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    name: '',
                    location: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    memberCount: 0,
                    facilities: [],
                    amenities: [],
                    description: '',
                    status: 'active',
                    pricePerHour: 0,
                    availableHours: '9:00 AM - 11:00 PM',
                    parkingSpaces: 0,
                    cateringAllowed: true,
                    alcoholAllowed: false,
                    smokingAllowed: false,
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
                    noOfFlats: 0,
                    // Google Maps Fields
                    latitude: 0,
                    longitude: 0,
                    formattedAddress: ''
                  });
                }}
                className="w-full"
              >
                Add Another Venue
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
            onClick={() => navigate('/venues')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Venues</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Venue</h1>
            <p className="text-gray-600">Create a new venue for hosting events</p>
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
                  <Building2 className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter venue name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter full address"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the venue and its features..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={formData.memberCount}
                        onChange={(e) => handleInputChange('memberCount', parseInt(e.target.value) || 0)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.memberCount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Maximum capacity"
                        min="1"
                      />
                    </div>
                    {errors.memberCount && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.memberCount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'pending')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.contactPerson ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter contact person name"
                  />
                  {errors.contactPerson && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contactPerson}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+91-9876543210"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extended Venue Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Extended Venue Details
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

            {/* Pricing & Availability */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Pricing & Availability</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Hour (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerHour}
                      onChange={(e) => handleInputChange('pricePerHour', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.pricePerHour ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                      step="100"
                    />
                    {errors.pricePerHour && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.pricePerHour}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Hours
                    </label>
                    <input
                      type="text"
                      value={formData.availableHours}
                      onChange={(e) => handleInputChange('availableHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9:00 AM - 11:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      value={formData.parkingSpaces}
                      onChange={(e) => handleInputChange('parkingSpaces', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facilities & Amenities */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Facilities & Amenities</h3>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Facilities Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-4">Facilities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {defaultFacilities.map((facility) => (
                      <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{facility}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Custom Facility
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customFacility}
                        onChange={(e) => setCustomFacility(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter custom facility"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFacility())}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomFacility}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>

                  {formData.facilities.filter(f => !defaultFacilities.includes(f)).length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Facilities
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.facilities
                          .filter(f => !defaultFacilities.includes(f))
                          .map((facility) => (
                            <div key={facility} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                              <span className="text-sm">{facility}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomFacility(facility)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-800 mb-4">Amenities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {defaultAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Custom Amenity
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter custom amenity"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAmenity())}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomAmenity}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>

                  {formData.amenities.filter(a => !defaultAmenities.includes(a)).length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Amenities
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.amenities
                          .filter(a => !defaultAmenities.includes(a))
                          .map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-md">
                              <span className="text-sm">{amenity}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomAmenity(amenity)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            {/* <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Venue Policies</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cateringAllowed}
                      onChange={(e) => handleInputChange('cateringAllowed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Catering Allowed</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.alcoholAllowed}
                      onChange={(e) => handleInputChange('alcoholAllowed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Alcohol Allowed</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smokingAllowed}
                      onChange={(e) => handleInputChange('smokingAllowed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Smoking Allowed</span>
                  </label>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Venue Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Venue Summary</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formData.memberCount > 0 ? formData.memberCount.toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Maximum Capacity</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price/Hour:</span>
                      <span className="font-medium">₹{formData.pricePerHour.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price/Day:</span>
                      <span className="font-medium">₹{formData.pricingPerDay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{formData.areaSqFt > 0 ? `${formData.areaSqFt} sq ft` : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parking:</span>
                      <span className="font-medium">{formData.parkingSpaces} spaces</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Facilities:</span>
                      <span className="font-medium">{formData.facilities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amenities:</span>
                      <span className="font-medium">{formData.amenities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={formData.status === 'active' ? 'success' : 'warning'}>
                        {formData.status}
                      </Badge>
                    </div>
                  </div>

                  {(formData.facilities.length > 0 || formData.amenities.length > 0) && (
                    <div className="pt-4 border-t border-gray-200">
                      {formData.facilities.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Selected Facilities ({formData.facilities.length})
                          </div>
                          <div className="space-y-1">
                            {formData.facilities.slice(0, 3).map((facility) => (
                              <div key={facility} className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 text-blue-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{facility}</span>
                              </div>
                            ))}
                            {formData.facilities.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{formData.facilities.length - 3} more facilities
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {formData.amenities.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Selected Amenities ({formData.amenities.length})
                          </div>
                          <div className="space-y-1">
                            {formData.amenities.slice(0, 3).map((amenity) => (
                              <div key={amenity} className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{amenity}</span>
                              </div>
                            ))}
                            {formData.amenities.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{formData.amenities.length - 3} more amenities
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                    <p>Provide accurate venue information for better bookings</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Include all available facilities and amenities</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Set competitive pricing based on market rates</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Ensure contact information is up to date</p>
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
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Venue...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Venue</span>
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/venues')}
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