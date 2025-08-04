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
  contactRole: string;
  email: string;
  phone: string;
  memberCount: number;
  facilities: string[];
  amenities: string[];
  description: string;
  status: 'active' | 'inactive' | 'pending';
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
  // Custom Contact Information
  customContacts: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  }>;
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
  const [isMapUpdating, setIsMapUpdating] = useState(false);
  const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    contactPerson: '',
    contactRole: '',
    email: '',
    phone: '',
    memberCount: 0,
    facilities: [],
    amenities: [],
    description: '',
    status: 'active',
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
    formattedAddress: '',
    // Custom Contact Information
    customContacts: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [customFacility, setCustomFacility] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      console.log('🔍 Starting Google Maps API loading...');
      
      // Test environment variable access
      const envVars = {
        importMeta: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        process: (process as any).env?.VITE_GOOGLE_MAPS_API_KEY,
        window: (window as any).VITE_GOOGLE_MAPS_API_KEY
      };
      
      console.log('🔑 Environment variable test:', envVars);
      
      console.log('🔑 API Key check:', {
        hasKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        keyLength: import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.length,
        keyStart: import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...',
        fullKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      });
      
      // Check if API is already loaded
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps API already loaded');
        try {
          setIsGoogleMapsAvailable(true);
          setGoogleMapsError(null);
          initializeMap();
        } catch (error) {
          console.error('Error initializing map:', error);
          setGoogleMapsError('Failed to initialize map');
          setIsGoogleMapsAvailable(false);
        }
        return;
      }

      // Try multiple ways to get the API key
      let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        apiKey = (process as any).env?.VITE_GOOGLE_MAPS_API_KEY;
      }
      if (!apiKey) {
        apiKey = (window as any).VITE_GOOGLE_MAPS_API_KEY;
      }
      
      // Fallback to hardcoded key for testing
      if (!apiKey) {
        console.log('⚠️ Using fallback API key for testing');
        apiKey = 'AIzaSyDhg6EWDV5yYQmpx71HL1up9mpgYL8eHaI';
      }
      
      console.log('🔑 Final API key:', apiKey ? 'Found' : 'Not found');
      
      if (!apiKey || apiKey === 'YOUR_API_KEY' || apiKey === '') {
        const errorMsg = 'Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file';
        console.error(errorMsg);
        setGoogleMapsError(errorMsg);
        setIsGoogleMapsAvailable(false);
        return;
      }
      
      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log('📜 Google Maps script already loading...');
        return;
      }

      console.log('📜 Creating Google Maps script...');
      const script = document.createElement('script');
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.src = scriptUrl;
      console.log('📜 Script URL:', scriptUrl);
      
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps script loaded successfully');
        try {
          setIsGoogleMapsAvailable(true);
          setGoogleMapsError(null);
          
          // Add a small delay to ensure the API is fully initialized
          setTimeout(() => {
            initializeMap();
          }, 100);
          
        } catch (error) {
          console.error('Error initializing map after script load:', error);
          setGoogleMapsError('Failed to initialize map after loading');
          setIsGoogleMapsAvailable(false);
        }
      };
      
      script.onerror = () => {
        const errorMsg = 'Failed to load Google Maps API. Please check your API key and network connection.';
        console.error(errorMsg);
        setGoogleMapsError(errorMsg);
        setIsGoogleMapsAvailable(false);
      };
      
      document.head.appendChild(script);
      console.log('📜 Google Maps script added to document head');
    };

    loadGoogleMapsAPI();
  }, []);

  const initializeMap = (retryCount = 0) => {
    try {
      console.log('🗺️ Starting map initialization...', retryCount > 0 ? `(retry ${retryCount})` : '');
      
      // Wait for the map container to be available
      if (!mapRef.current) {
        if (retryCount < 10) { // Max 10 retries (1 second total)
          console.log('⏳ Map container not ready, retrying in 100ms...');
          setTimeout(() => {
            initializeMap(retryCount + 1);
          }, 100);
          return;
        } else {
          console.error('❌ Map container not available after 10 retries');
          setGoogleMapsError('Failed to initialize map container');
          setIsGoogleMapsAvailable(false);
          return;
        }
      }

      if (!window.google || !window.google.maps) {
        console.error('❌ Google Maps API is not loaded');
        return;
      }

      console.log('✅ Google Maps API is available');
      console.log('📍 Map container:', mapRef.current);

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      console.log('✅ Map created successfully');
      mapInstanceRef.current = map;

      // Initialize regular marker (more reliable)
      const marker = new window.google.maps.Marker({
        map: map,
        position: { lat: 20.5937, lng: 78.9629 },
        draggable: true,
        title: 'Venue Location'
      });

      markerRef.current = marker;

      // Add marker drag listener
      marker.addListener('dragend', () => {
        try {
          console.log('🎯 Marker drag ended');
          const position = marker.getPosition();
          if (position) {
            console.log('📍 Marker position after drag:', { lat: position.lat(), lng: position.lng() });
            updateAddressFromCoordinates(position.lat(), position.lng());
          }
        } catch (error) {
          console.error('❌ Error in marker dragend:', error);
        }
      });

      // Add map click listener
      map.addListener('click', (event: any) => {
        try {
          console.log('🎯 Map clicked');
          const position = event.latLng;
          if (position) {
            console.log('📍 Click position:', { lat: position.lat(), lng: position.lng() });
            marker.setPosition(position);
            updateAddressFromCoordinates(position.lat(), position.lng());
          }
        } catch (error) {
          console.error('❌ Error in map click:', error);
        }
      });

      console.log('✅ Map initialization completed successfully');

    } catch (error) {
      console.error('❌ Error initializing map:', error);
    }
  };

  const updateAddressFromCoordinates = (lat: number, lng: number) => {
    try {
      console.log('🗺️ Updating address from coordinates:', { lat, lng });
      
      if (!window.google || !window.google.maps) {
        console.error('❌ Google Maps API is not loaded for geocoding');
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };

      console.log('🔍 Starting geocoding...');
      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        try {
          console.log('📍 Geocoding result:', { status, resultsCount: results?.length });
          
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const addressComponents = result.address_components;
            
            console.log('🏠 Full address:', result.formatted_address);
            console.log('🏗️ Address components:', addressComponents);
            
            // Extract address components
            let streetNumber = '';
            let route = '';
            let locality = '';
            let administrativeArea = '';
            let postalCode = '';
            let landmark = '';

            for (const component of addressComponents) {
              const types = component.types;
              
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
              } else if (types.includes('route')) {
                route = component.long_name;
              } else if (types.includes('locality')) {
                locality = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                administrativeArea = component.long_name;
              } else if (types.includes('postal_code')) {
                postalCode = component.long_name;
              } else if (types.includes('establishment') || types.includes('point_of_interest')) {
                landmark = component.long_name;
              }
            }

            console.log('🏠 Parsed components:', {
              streetNumber,
              route,
              locality,
              administrativeArea,
              postalCode,
              landmark
            });

            // Auto-populate form fields
            const updatedFormData = {
              latitude: lat,
              longitude: lng,
              formattedAddress: result.formatted_address,
              addressLine1: streetNumber && route ? `${streetNumber} ${route}` : route || '',
              addressStandard: result.formatted_address,
              addressLandmark: landmark || result.formatted_address.split(',')[0] || '',
              location: locality || administrativeArea || ''
            };

            console.log('📝 Updating form with:', updatedFormData);
            
            setFormData(prev => {
              const newData = {
                ...prev,
                ...updatedFormData
              };
              console.log('✅ Form updated:', newData);
              return newData;
            });
            
            console.log('✅ Address auto-population completed');
          } else {
            console.log('❌ Geocoding failed:', status);
          }
        } catch (error) {
          console.error('❌ Error in geocoding callback:', error);
        }
      });
    } catch (error) {
      console.error('❌ Error in updateAddressFromCoordinates:', error);
    }
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
    console.log('🔍 Starting form validation...');
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
      console.log('❌ Name validation failed: empty');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Venue name must be at least 3 characters';
      console.log('❌ Name validation failed: too short');
    } else {
      console.log('✅ Name validation passed');
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      console.log('❌ Location validation failed: empty');
    } else {
      console.log('✅ Location validation passed');
    }

    // Contact person validation
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
      console.log('❌ Contact person validation failed: empty');
    } else {
      console.log('✅ Contact person validation passed');
    }

    // Contact role validation
    if (!formData.contactRole.trim()) {
      newErrors.contactRole = 'Contact role is required';
      console.log('❌ Contact role validation failed: empty');
    } else {
      console.log('✅ Contact role validation passed');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      console.log('❌ Email validation failed: empty');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      console.log('❌ Email validation failed: invalid format');
    } else {
      console.log('✅ Email validation passed');
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      console.log('❌ Phone validation failed: empty');
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
      console.log('❌ Phone validation failed: invalid format');
    } else {
      console.log('✅ Phone validation passed');
    }

    // Capacity validation
    if (formData.memberCount <= 0) {
      newErrors.memberCount = 'Capacity must be greater than 0';
      console.log('❌ Capacity validation failed: <= 0');
    } else {
      console.log('✅ Capacity validation passed');
    }

    // Price validation
    if (formData.pricingPerDay < 0) {
      newErrors.pricingPerDay = 'Price cannot be negative';
      console.log('❌ Price validation failed: negative');
    } else {
      console.log('✅ Price validation passed');
    }

    // Extended fields validation - only validate required fields
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
      console.log('❌ Address line 1 validation failed: empty');
    } else {
      console.log('✅ Address line 1 validation passed');
    }

    if (!formData.addressStandard.trim()) {
      newErrors.addressStandard = 'Standard address format is required';
      console.log('❌ Address standard validation failed: empty');
    } else {
      console.log('✅ Address standard validation passed');
    }

    if (formData.areaSqFt <= 0) {
      newErrors.areaSqFt = 'Area must be greater than 0';
      console.log('❌ Area validation failed: <= 0');
    } else {
      console.log('✅ Area validation passed');
    }

    if (!formData.kindOfSpace.trim()) {
      newErrors.kindOfSpace = 'Kind of space is required';
      console.log('❌ Kind of space validation failed: empty');
    } else {
      console.log('✅ Kind of space validation passed');
    }

    if (formData.pricingPerDay < 0) {
      newErrors.pricingPerDay = 'Pricing per day cannot be negative';
      console.log('❌ Pricing per day validation failed: negative');
    } else {
      console.log('✅ Pricing per day validation passed');
    }

    if (formData.facilityAreaSqFt < 0) {
      newErrors.facilityAreaSqFt = 'Facility area cannot be negative';
      console.log('❌ Facility area validation failed: negative');
    } else {
      console.log('✅ Facility area validation passed');
    }

    console.log('📊 Validation summary:', {
      totalErrors: Object.keys(newErrors).length,
      errors: newErrors
    });

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

  // Custom Contact Management Functions
  const addCustomContact = () => {
    const newContact = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      role: ''
    };
    
    setFormData(prev => ({
      ...prev,
      customContacts: [...prev.customContacts, newContact]
    }));
    
  };

  const updateCustomContact = (id: string, field: string, value: string) => {
    
    setFormData(prev => ({
      ...prev,
      customContacts: prev.customContacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    }));
    
  };

  const removeCustomContact = (id: string) => {
    
    setFormData(prev => ({
      ...prev,
      customContacts: prev.customContacts.filter(contact => contact.id !== id)
    }));
    
  };

  const checkForDuplicates = async (): Promise<{ hasDuplicates: boolean; message: string }> => {
    try {
      // Check for duplicate venue names
      const { data: nameDuplicates, error: nameError } = await supabase
        .from('venues')
        .select('id, name')
        .ilike('name', formData.name.trim())
        .neq('id', ''); // Exclude current venue if editing

      if (nameError) throw nameError;

      if (nameDuplicates && nameDuplicates.length > 0) {
        return {
          hasDuplicates: true,
          message: `A venue with the name "${formData.name}" already exists. Please choose a different name.`
        };
      }

      // Check for duplicate addresses
      const { data: addressDuplicates, error: addressError } = await supabase
        .from('venues')
        .select('id, name, address_line1')
        .ilike('address_line1', formData.addressLine1.trim())
        .neq('id', ''); // Exclude current venue if editing

      if (addressError) throw addressError;

      if (addressDuplicates && addressDuplicates.length > 0) {
        return {
          hasDuplicates: true,
          message: `A venue with the address "${formData.addressLine1}" already exists (${addressDuplicates[0].name}). Please verify the address.`
        };
      }

      return { hasDuplicates: false, message: '' };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return { hasDuplicates: false, message: '' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Starting form submission...');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');
    setIsSubmitting(true);

    try {
      // Check for duplicates
      const duplicateCheck = await checkForDuplicates();
      if (duplicateCheck.hasDuplicates) {
        showNotification(duplicateCheck.message, 'error');
        setIsSubmitting(false);
        return;
      }

      const insertData = {
        name: formData.name,
        location: formData.location,
        contact_person: formData.contactPerson,
        contact_role: formData.contactRole,
        email: formData.email,
        phone: formData.phone,
        capacity: formData.memberCount,
        facilities: formData.facilities,
        amenities: formData.amenities,
        description: formData.description,
        status: formData.status,
        // Extended Fields
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
        // Google Maps Fields
        latitude: formData.latitude,
        longitude: formData.longitude,
        formatted_address: formData.formattedAddress,
        // Custom Contact Information
        custom_contacts: formData.customContacts
      };

      console.log('📝 Insert data:', insertData);

      const { data, error } = await supabase
        .from('venues')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Venue created successfully:', data);
      showNotification('Venue created successfully!', 'success');
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/venues');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating venue:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create venue. Please try again.';
      setErrors({ submit: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Notification function
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-2">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>${message}</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
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
          contactRole: '',
          email: '',
          phone: '',
          memberCount: 0,
          facilities: [],
          amenities: [],
          description: '',
          status: 'active',
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
          formattedAddress: '',
          // Custom Contact Information
          customContacts: []
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
                    Address Line 1 * / select from google maps
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
                    {isGoogleMapsAvailable ? (
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
                    ) : (
                      <div className="w-full h-64 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <div className="text-center p-6">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {googleMapsError ? 'Map Unavailable' : 'Loading Map...'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {googleMapsError || 'Please wait while we load the map...'}
                          </p>
                          {googleMapsError && (
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>• You can still manually enter address details below</p>
                              <p>• Map functionality will be available once API key is configured</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {isGoogleMapsAvailable && (
                      <div className="text-sm text-gray-600">
                        <p>• Click on the map to set the location</p>
                        <p>• Drag the marker to adjust the position</p>
                        <p>• Address will be automatically filled based on the selected location</p>
                      </div>
                    )}
                    
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
              <CardContent className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <input
                      type="text"
                      value={formData.contactRole}
                      onChange={(e) => handleInputChange('contactRole', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.contactRole ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Manager, Coordinator, etc."
                    />
                    {errors.contactRole && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.contactRole}
                      </p>
                    )}
                  </div>
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

            {/* Custom Contact Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Additional Contact Information
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomContact}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Contact</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.customContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No additional contacts added yet</p>
                    <p className="text-sm">Click "Add Contact" to add multiple contact persons</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.customContacts.map((contact, index) => (
                      <div key={contact.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Contact Person {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomContact(contact.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => updateCustomContact(contact.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter contact name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <input
                              type="text"
                              value={contact.role}
                              onChange={(e) => updateCustomContact(contact.id, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Manager, Coordinator, etc."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => updateCustomContact(contact.id, 'email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter email address"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => updateCustomContact(contact.id, 'phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="+91-9876543210"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.customContacts.length > 0 && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p className="flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Additional contacts will be stored with the venue and can be used for event coordination.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Extended Venue Details */}
            {/* <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Venue Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
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
            </Card> */}



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
                      <span className="text-gray-600">Price/Day:</span>
                      <span className="font-medium">₹{formData.pricingPerDay > 0 ? formData.pricingPerDay.toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{formData.areaSqFt > 0 ? `${formData.areaSqFt} sq ft` : 'Not set'}</span>
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