import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar as CalendarIcon, Users, Filter, Search, X, Save, AlertTriangle, Upload, Image, Clock, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { Event } from '../types';
import { supabase } from '../lib/supabase';
import { useEvents, useVenues } from '../hooks/useSupabaseData';

interface ExtendedEventFormData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venueId: string;
  venueName: string;
  city: string;
  maxCapacity: number;
  planType: 'Plan A' | 'Plan B' | 'Plan C' | 'Custom';
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
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

export const Events: React.FC = () => {
  const { events, loading, refetch } = useEvents();
  const { venues } = useVenues();
  // const [localEvents, setLocalEvents] = useState<Event[]>([]); // for local UI updates if needed
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<ExtendedEventFormData | null>(null);
  const [editErrors, setEditErrors] = useState<{[key: string]: string}>({});
  const [isMapUpdating, setIsMapUpdating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'ongoing': return 'info';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    // Map Event to ExtendedEventFormData with default values for missing fields
    setEditFormData({
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      venueId: event.venueId || '',
      venueName: event.venue,
      city: event.city || '',
      maxCapacity: event.maxCapacity,
      planType: event.planType || 'Plan A',
      status: event.status,
      attendees: event.attendees,
      totalRevenue: event.totalRevenue,
      // Extended Fields - set defaults for existing events
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
      eventImageUrl: event.eventImageUrl || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      let imageUrl = editFormData.eventImageUrl;

      // Upload image to Supabase storage if a new image is selected
      if (editFormData.eventImage) {
        const fileExt = editFormData.eventImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, editFormData.eventImage);

        if (uploadError) {
          alert(`Image upload failed: ${uploadError.message}`);
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('events')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          event_date: editFormData.date,
          event_time: editFormData.time,
          venue_id: editFormData.venueId,
          venue_name: editFormData.venueName,
          city: editFormData.city,
          max_capacity: editFormData.maxCapacity,
          plan_type: editFormData.planType,
          status: editFormData.status,
          attendees: editFormData.attendees,
          total_revenue: editFormData.totalRevenue,
          // Extended fields
          address_line1: editFormData.addressLine1,
          address_landmark: editFormData.addressLandmark,
          address_standard: editFormData.addressStandard,
          area_sq_ft: editFormData.areaSqFt,
          kind_of_space: editFormData.kindOfSpace,
          is_covered: editFormData.isCovered,
          pricing_per_day: editFormData.pricingPerDay,
          facility_area_sq_ft: editFormData.facilityAreaSqFt,
          no_of_stalls: editFormData.noOfStalls,
          facility_covered: editFormData.facilityCovered,
          amenities: editFormData.amenities,
          no_of_flats: editFormData.noOfFlats,
          // Google Maps fields
          latitude: editFormData.latitude,
          longitude: editFormData.longitude,
          formatted_address: editFormData.formattedAddress,
          // Image field
          event_image_url: imageUrl
        })
        .eq('id', editFormData.id);

      if (!error) {
        setShowEditModal(false);
        setEditFormData(null);
        setSelectedEvent(null);
        refetch(); // reload events from Supabase
      } else {
        alert('Failed to update event: ' + error.message);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEvent) {
      const { error, data } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id);

      console.log('Delete response:', { error, data, id: selectedEvent.id });

      if (!error) {
        setShowDeleteModal(false);
        setSelectedEvent(null);
        refetch(); // reload events from Supabase
        if (Array.isArray(data) && (data as any[]).length === 0) {
          alert('No event was deleted. This may be due to row-level security or a missing ID.');
        }
      } else {
        alert('Failed to delete event: ' + error.message);
      }
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedEvent(null);
    setEditFormData(null);
    setEditErrors({});
  };

  const handleImageUpload = (file: File) => {
    if (!editFormData) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setEditErrors(prev => ({ ...prev, eventImage: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditErrors(prev => ({ ...prev, eventImage: 'Image size must be less than 5MB' }));
      return;
    }

    setEditFormData(prev => prev ? ({
      ...prev,
      eventImage: file,
      eventImageUrl: URL.createObjectURL(file)
    }) : null);

    // Clear error
    if (editErrors.eventImage) {
      setEditErrors(prev => ({ ...prev, eventImage: '' }));
    }
  };

  const removeImage = () => {
    if (!editFormData) return;
    
    setEditFormData(prev => prev ? ({
      ...prev,
      eventImage: null,
      eventImageUrl: ''
    }) : null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage all society events and bookings</p>
        </div>
        <Link to="/events/create">
          <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by title, venue, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          {['all', 'draft', 'published', 'ongoing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors duration-200 ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Events' : status}
              <span className="ml-1 sm:ml-2 text-xs">
                {status === 'all' ? events.length : events.filter(e => e.status === status).length}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            onClick={() => setViewMode('grid')}
            className="text-xs sm:text-sm"
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            onClick={() => setViewMode('table')}
            className="text-xs sm:text-sm"
          >
            Table
          </Button>
        </div>
      </div>

      {/* Events Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                {/* Event Image */}
                {event.eventImageUrl && (
                  <div className="mb-4">
                    <img
                      src={event.eventImageUrl}
                      alt={event.title}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                  <Badge variant={getStatusVariant(event.status)} className="ml-2 flex-shrink-0">
                    {event.status}
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{event.venue}, {event.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{event.attendees}/{event.maxCapacity} attendees</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">₹{event.totalRevenue.toLocaleString()}</span>
                    <span className="text-gray-500 ml-1 hidden sm:inline">revenue</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleView(event)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(event)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Events Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Events Overview ({filteredEvents.length})
              </h3>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Advanced Filter</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="hidden sm:table-cell">Date & Time</TableHead>
                  <TableHead className="hidden md:table-cell">Venue</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{event.title}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{event.date}</div>
                        <div className="text-sm text-gray-500 md:hidden">{event.city}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        <div>{event.date}</div>
                        <div className="text-gray-500">{event.time}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        <div>{event.venue}</div>
                        <div className="text-gray-500">{event.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(event.attendees / event.maxCapacity) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{event.attendees}/{event.maxCapacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-medium">₹{event.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleView(event)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(event)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Event Image */}
              {selectedEvent.eventImageUrl && (
                <div>
                  <img
                    src={selectedEvent.eventImageUrl}
                    alt="Event"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-4 h-4 mr-2"></span>
                      <span>{selectedEvent.time}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{selectedEvent.venue}, {selectedEvent.city}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Attendance</h4>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{selectedEvent.attendees} / {selectedEvent.maxCapacity} attendees</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(selectedEvent.attendees / selectedEvent.maxCapacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Revenue</h4>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{selectedEvent.totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                <Badge variant={getStatusVariant(selectedEvent.status)} className="text-sm">
                  {selectedEvent.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={closeModals}>Close</Button>
              <Button onClick={() => { closeModals(); handleEdit(selectedEvent); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={editFormData.time}
                        onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
                    <select
                      value={editFormData.venueId}
                      onChange={(e) => {
                        const selectedVenue = venues.find(v => v.id === e.target.value);
                        setEditFormData({
                          ...editFormData, 
                          venueId: e.target.value,
                          venueName: selectedVenue?.name || '',
                          city: selectedVenue?.location?.split(',').pop()?.trim() || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a venue</option>
                      {venues.map((venue) => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name} - {venue.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={editFormData.city || ''}
                        onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity *</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={editFormData.maxCapacity}
                        onChange={(e) => setEditFormData({...editFormData, maxCapacity: parseInt(e.target.value) || 0})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Event Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Event Image
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
                  <div className="space-y-4">
                    {editFormData.eventImageUrl ? (
                      <div className="relative">
                        <img
                          src={editFormData.eventImageUrl}
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
                          id="edit-event-image-upload"
                        />
                        <label
                          htmlFor="edit-event-image-upload"
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
                    {editErrors.eventImage && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {editErrors.eventImage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Extended Event Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Extended Event Details
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={editFormData.addressLine1}
                    onChange={(e) => setEditFormData({...editFormData, addressLine1: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Flat/Lane/Building..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                  <input
                    type="text"
                    value={editFormData.addressLandmark}
                    onChange={(e) => setEditFormData({...editFormData, addressLandmark: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Near hospital/mall etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standard Address Format</label>
                  <input
                    type="text"
                    value={editFormData.addressStandard}
                    onChange={(e) => setEditFormData({...editFormData, addressStandard: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123, Street, City, PIN"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq ft)</label>
                    <input
                      type="number"
                      value={editFormData.areaSqFt}
                      onChange={(e) => setEditFormData({...editFormData, areaSqFt: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter area in sq ft"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kind of Space</label>
                    <input
                      type="text"
                      value={editFormData.kindOfSpace}
                      onChange={(e) => setEditFormData({...editFormData, kindOfSpace: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Community Hall, Parking etc."
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editFormData.isCovered}
                        onChange={(e) => setEditFormData({...editFormData, isCovered: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Covered Space</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Per Day</label>
                    <input
                      type="number"
                      value={editFormData.pricingPerDay}
                      onChange={(e) => setEditFormData({...editFormData, pricingPerDay: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter pricing per day"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facility Area (sq ft)</label>
                    <input
                      type="number"
                      value={editFormData.facilityAreaSqFt}
                      onChange={(e) => setEditFormData({...editFormData, facilityAreaSqFt: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter facility area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">No. of Stalls</label>
                    <input
                      type="number"
                      value={editFormData.noOfStalls}
                      onChange={(e) => setEditFormData({...editFormData, noOfStalls: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of stalls"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editFormData.facilityCovered}
                        onChange={(e) => setEditFormData({...editFormData, facilityCovered: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Facility Covered</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <input
                      type="text"
                      value={editFormData.amenities}
                      onChange={(e) => setEditFormData({...editFormData, amenities: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter available amenities"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">No. of Flats</label>
                    <input
                      type="number"
                      value={editFormData.noOfFlats}
                      onChange={(e) => setEditFormData({...editFormData, noOfFlats: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of flats"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={closeModals}>Cancel</Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "<strong>{selectedEvent.title}</strong>"? 
                This will permanently remove the event and all associated data.
              </p>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={closeModals}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirmDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};