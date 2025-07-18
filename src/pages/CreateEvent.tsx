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
  User
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
    totalRevenue: 0
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert event into Supabase
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
          vendor_ids: []
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Event created successfully:', data);
      
      setSubmitSuccess(true);
      // Set a flag in localStorage to trigger refetch on Events page
      localStorage.setItem('eventCreated', '1');
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
                    totalRevenue: 0
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