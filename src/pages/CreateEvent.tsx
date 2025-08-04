import React, { useState } from 'react';
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
  Image,
  DollarSign
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
  eventEndDate: string;
  eventTime: string;
  eventEndTime: string;
  venueId: string;
  venueName: string;
  city: string;
  maxCapacity: number;
  planType: 'Plan A' | 'Plan B' | 'Plan C' | 'Custom';
  status: 'draft' | 'published';
  attendees: number;
  totalRevenue: number;
  // Image Field
  eventImage: File | null;
  eventImageUrl: string;
  // Venue Facilities & Amenities
  venueFacilities: string[];
  venueAmenities: string[];
  // Selected Facilities & Amenities for Event
  selectedFacilities: string[];
  selectedAmenities: string[];
  // Stalls Configuration
  noOfStalls: number;
  stallSize: string;
  stallCategory: string;
  // Pricing & Availability
  pricePerHour: number;
  availableHours: string;
  parkingSpaces: number;
  cateringAllowed: boolean;
  alcoholAllowed: boolean;
  smokingAllowed: boolean;
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
    eventEndDate: '',
    eventTime: '',
    eventEndTime: '',
    venueId: '',
    venueName: '',
    city: '',
    maxCapacity: 100,
    planType: 'Plan A',
    status: 'draft',
    attendees: 0,
    totalRevenue: 0,
    // Image Field
    eventImage: null,
    eventImageUrl: '',
    // Venue Facilities & Amenities
    venueFacilities: [],
    venueAmenities: [],
    // Selected Facilities & Amenities for Event
    selectedFacilities: [],
    selectedAmenities: [],
    // Stalls Configuration
    noOfStalls: 0,
    stallSize: '',
    stallCategory: '',
    // Pricing & Availability
    pricePerHour: 0,
    availableHours: '',
    parkingSpaces: 0,
    cateringAllowed: false,
    alcoholAllowed: false,
    smokingAllowed: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

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
      newErrors.eventDate = 'Event start date is required';
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.eventDate = 'Event start date cannot be in the past';
      }
    }

    // End date validation
    if (!formData.eventEndDate) {
      newErrors.eventEndDate = 'Event end date is required';
    } else if (formData.eventDate && formData.eventEndDate) {
      const startDate = new Date(formData.eventDate);
      const endDate = new Date(formData.eventEndDate);
      
      if (endDate < startDate) {
        newErrors.eventEndDate = 'Event end date cannot be before start date';
      }
    }

    // Time validation
    if (!formData.eventTime) {
      newErrors.eventTime = 'Event start time is required';
    }

    if (!formData.eventEndTime) {
      newErrors.eventEndTime = 'Event end time is required';
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

    // Image validation
    if (!formData.eventImage && !formData.eventImageUrl) {
      newErrors.eventImage = 'Event image is required';
    }

    // Pricing validation
    if (formData.pricePerHour < 0) {
      newErrors.pricePerHour = 'Price per hour cannot be negative';
    }

    if (formData.parkingSpaces < 0) {
      newErrors.parkingSpaces = 'Parking spaces cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the specific field only
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-populate venue name and city when venue is selected
    if (field === 'venueId' && value) {
      
      const selectedVenue = venues.find(v => v.id === value);
      
      if (selectedVenue) {
        
        const updatedData = {
          venueName: selectedVenue.name,
          city: selectedVenue.location?.split(',').pop()?.trim() || '',
          maxCapacity: selectedVenue.memberCount || 100,
          venueFacilities: selectedVenue.facilities || [],
          venueAmenities: selectedVenue.amenities || [],
          noOfStalls: selectedVenue.noOfStalls || 0
        };
        
        
        setFormData(prev => ({
          ...prev,
          ...updatedData
        }));
        
      }
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

    
    const imageUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      eventImage: file,
      eventImageUrl: imageUrl
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

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFacilities: prev.selectedFacilities.includes(facility)
        ? prev.selectedFacilities.filter(f => f !== facility)
        : [...prev.selectedFacilities, facility]
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenity)
        ? prev.selectedAmenities.filter(a => a !== amenity)
        : [...prev.selectedAmenities, amenity]
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

        
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      } else {
        
      }

      
      const insertData = {
          title: formData.title,
          description: formData.description,
          event_date: formData.eventDate,
        event_end_date: formData.eventEndDate,
          event_time: formData.eventTime,
        event_end_time: formData.eventEndTime,
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
        // Image field
        event_image_url: imageUrl,
        // Pricing & Availability
        price_per_hour: formData.pricePerHour,
        available_hours: formData.availableHours,
        parking_spaces: formData.parkingSpaces,
        catering_allowed: formData.cateringAllowed,
        alcohol_allowed: formData.alcoholAllowed,
        smoking_allowed: formData.smokingAllowed
      };

      
      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      
      setSubmitSuccess(true);
      showNotification('Event created successfully!', 'success');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/events');
      }, 2000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event. Please try again.';
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
                    eventEndDate: '',
                    eventTime: '',
                    eventEndTime: '',
                    venueId: '',
                    venueName: '',
                    city: '',
                    maxCapacity: 100,
                    planType: 'Plan A',
                    status: 'draft',
                    attendees: 0,
                    totalRevenue: 0,
                    eventImage: null,
                    eventImageUrl: '',
                    venueFacilities: [],
                    venueAmenities: [],
                    // Selected Facilities & Amenities for Event
                    selectedFacilities: [],
                    selectedAmenities: [],
                    // Stalls Configuration
                    noOfStalls: 0,
                    stallSize: '',
                    stallCategory: '',
                    // Pricing & Availability
                    pricePerHour: 0,
                    availableHours: '',
                    parkingSpaces: 0,
                    cateringAllowed: false,
                    alcoholAllowed: false,
                    smokingAllowed: false
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
                      Event Start Date *
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
                      Event End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.eventEndDate}
                      onChange={(e) => handleInputChange('eventEndDate', e.target.value)}
                      min={formData.eventDate || new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.eventEndDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.eventEndDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.eventEndDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Start Time *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event End Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={formData.eventEndTime}
                        onChange={(e) => handleInputChange('eventEndTime', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.eventEndTime ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.eventEndTime && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.eventEndTime}
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

                {/* Venue Facilities & Amenities Selection */}
                {(formData.venueFacilities.length > 0 || formData.venueAmenities.length > 0) && (
                  <div className="mt-6 space-y-6">
                    {/* Facilities Selection */}
                    {formData.venueFacilities.length > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          Select Facilities for Event ({formData.selectedFacilities.length} selected)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {formData.venueFacilities.map((facility) => (
                            <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.selectedFacilities.includes(facility)}
                                onChange={() => handleFacilityToggle(facility)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{facility}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Select the facilities you want to use for this event
                        </p>
                      </div>
                    )}
                    
                    {/* Amenities Selection */}
                    {formData.venueAmenities.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Select Amenities for Event ({formData.selectedAmenities.length} selected)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {formData.venueAmenities.map((amenity) => (
                            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.selectedAmenities.includes(amenity)}
                                onChange={() => handleAmenityToggle(amenity)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">{amenity}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          Select the amenities you want to use for this event
                        </p>
                      </div>
                    )}
                  </div>
                )}
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

            {/* Stalls Configuration */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Stalls Configuration
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Stalls
                    </label>
                    <input
                      type="number"
                      value={formData.noOfStalls}
                      onChange={(e) => handleInputChange('noOfStalls', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of stalls"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.venueName ? `Available at ${formData.venueName}: ${formData.noOfStalls}` : 'Select a venue first'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stall Size
                    </label>
                    <select
                      value={formData.stallSize}
                      onChange={(e) => handleInputChange('stallSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select stall size</option>
                      <option value="Small (6x6 ft)">Small (6x6 ft)</option>
                      <option value="Medium (8x8 ft)">Medium (8x8 ft)</option>
                      <option value="Large (10x10 ft)">Large (10x10 ft)</option>
                      <option value="Extra Large (12x12 ft)">Extra Large (12x12 ft)</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stall Category
                    </label>
                    <select
                      value={formData.stallCategory}
                      onChange={(e) => handleInputChange('stallCategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Arts & Crafts">Arts & Crafts</option>
                      <option value="Technology">Technology</option>
                      <option value="Fashion & Accessories">Fashion & Accessories</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Availability */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing & Availability
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Per Hour
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={formData.pricePerHour}
                        onChange={(e) => handleInputChange('pricePerHour', Number(e.target.value))}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.pricePerHour ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter price per hour"
                        min="0"
                        step="0.01"
                      />
                    </div>
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
                      placeholder="e.g., 9:00 AM - 11:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      value={formData.parkingSpaces}
                      onChange={(e) => handleInputChange('parkingSpaces', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.parkingSpaces ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Number of parking spaces"
                      min="0"
                    />
                    {errors.parkingSpaces && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.parkingSpaces}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Event Policies
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.cateringAllowed}
                        onChange={(e) => handleInputChange('cateringAllowed', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Catering Allowed</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.alcoholAllowed}
                        onChange={(e) => handleInputChange('alcoholAllowed', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Alcohol Allowed</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.smokingAllowed}
                        onChange={(e) => handleInputChange('smokingAllowed', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Smoking Allowed</span>
                    </label>
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
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {formData.eventDate ? new Date(formData.eventDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">
                        {formData.eventEndDate ? new Date(formData.eventEndDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{formData.eventTime || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">{formData.eventEndTime || 'Not set'}</span>
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
