import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar as CalendarIcon, Users, Filter, Search, X, Save, AlertTriangle, Upload, Image, Clock, Building2, DollarSign, IndianRupee, IndianRupeeIcon, CheckCircle, Info, ArrowLeft, User, AlertCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { Event } from '../types';
import { supabase } from '../lib/supabase';
import { useEvents, useVenues, useVendors, useExhibitors } from '../hooks/useSupabaseData';

interface StallConfigRow {
  id: string;
  stallNo: string;
  stallSize: string;
  stallCategory: string;
  price: number;
}

interface ExtendedEventFormData {
  id: string;
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
  status: 'draft' | 'upcoming' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  attendees: number;
  totalRevenue: number;
  // Image Field
  eventImage: File | null;
  eventImageUrl: string;
  // Layout Image Field
  layoutImage: File | null;
  layoutImageUrl: string;
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
  // Unified stall config
  allStalls: StallConfigRow[];
}

export const Events: React.FC = () => {
  const { events, loading, refetch } = useEvents();
  const { venues } = useVenues();
  const { vendors } = useVendors();
  const { exhibitors } = useExhibitors();
  const [exhibitorUpdates, setExhibitorUpdates] = useState<Record<string, string>>({});

  // Helper functions to get names from IDs
  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : `Vendor ID: ${vendorId}`;
  };

  const getExhibitorName = (exhibitorId: string) => {
    const exhibitor = exhibitors.find(e => e.id === exhibitorId);
    return exhibitor ? exhibitor.companyName || `${exhibitor.firstName} ${exhibitor.lastName}` : `Exhibitor ID: ${exhibitorId}`;
  };

  // const [localEvents, setLocalEvents] = useState<Event[]>([]); // for local UI updates if needed
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<ExtendedEventFormData | null>(null);
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [editActiveTab, setEditActiveTab] = useState<'event' | 'exhibitor'>('event');
  const [viewActiveTab, setViewActiveTab] = useState<'event' | 'exhibitor'>('event');
  const [selectedExhibitorsForEdit, setSelectedExhibitorsForEdit] = useState<string[]>([]);
  const [exhibitorSearchTerm, setExhibitorSearchTerm] = useState('');
  
  // Stall removal modal state
  const [showDeleteStallModal, setShowDeleteStallModal] = useState(false);
  const [stallToRemove, setStallToRemove] = useState<{ index: number; stallNumber: string } | null>(null);

  // Vendors/Exhibitors selection
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedExhibitors, setSelectedExhibitors] = useState<string[]>([]);

  const toggleVendor = (id: string) => {
    setSelectedVendors(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const toggleExhibitor = (id: string) => {
    setSelectedExhibitors(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  // Stalls management functions
  const validateStallCountChange = (newCount: number, currentCount: number): { isValid: boolean; message: string } => {
    const MIN_STALLS = 1;
    const MAX_STALLS = 100; // Reasonable maximum
    
    // Check minimum stalls
    if (newCount < MIN_STALLS) {
      return { 
        isValid: false, 
        message: `Minimum ${MIN_STALLS} stall required. Cannot set to ${newCount}.` 
      };
    }
    
    // Check maximum stalls
    if (newCount > MAX_STALLS) {
      return { 
        isValid: false, 
        message: `Maximum ${MAX_STALLS} stalls allowed. Cannot set to ${newCount}.` 
      };
    }
    
    // Check if reducing stalls when there are configured stalls
    if (newCount < currentCount) {
      return { 
        isValid: false, 
        message: `Cannot reduce stalls from ${currentCount} to ${newCount}. You have ${currentCount} configured stalls. Please remove excess stalls first, then reduce the count.` 
      };
    }
    
    return { isValid: true, message: '' };
  };

  const handleStallCountChange = (newCount: number) => {
    if (!editFormData) return;
    
    const currentConfiguredStalls = editFormData.allStalls.length;
    const validation = validateStallCountChange(newCount, currentConfiguredStalls);
    
    if (!validation.isValid) {
      showNotification(validation.message, 'error');
      return;
    }
    
    // If reducing stalls and there are excess stalls, show error and don't allow the change
    if (newCount < currentConfiguredStalls) {
      const excessStalls = currentConfiguredStalls - newCount;
      showNotification(
        `Cannot reduce stalls to ${newCount}. You have ${currentConfiguredStalls} configured stalls. ` +
        `Please manually remove ${excessStalls} excess stall(s) first, then reduce the count.`, 
        'error'
      );
      return; // Don't update the count
    }
    
    // Normal case - just update the count
    setEditFormData(prev => prev ? ({
      ...prev,
      noOfStalls: newCount
    }) : null);
  };

  const addStall = () => {
    if (!editFormData) return;

    const currentStallCount = editFormData.allStalls.length;
    const maxStalls = editFormData.noOfStalls || editFormData.allStalls.length;

    if (maxStalls > 0 && currentStallCount >= maxStalls) {
      showNotification(`Cannot add more stalls. Maximum limit is ${maxStalls} stalls. You have already configured ${currentStallCount} stalls.`, 'error');
      return;
    }

    setEditFormData(prev => prev ? ({
      ...prev,
      allStalls: [...prev.allStalls, { id: Date.now().toString(), stallNo: '', stallSize: '', stallCategory: '', price: 0 }]
    }) : null);
  };

  const updateStall = (index: number, field: keyof StallConfigRow, value: any) => {
    if (!editFormData) return;
    setEditFormData(prev => {
      if (!prev) return null;
      const rows = [...prev.allStalls];
      rows[index] = { ...rows[index], [field]: field === 'price' ? Number(value) || 0 : value } as StallConfigRow;
      return { ...prev, allStalls: rows };
    });
  };

  const removeStall = (index: number) => {
    if (!editFormData) return;
    
    const stallToRemove = editFormData.allStalls[index];
    const stallNumber = stallToRemove.stallNo || `Stall ${index + 1}`;
    
    // Set the stall to be removed and show confirmation modal
    setStallToRemove({ index, stallNumber });
    setShowDeleteStallModal(true);
  };

  const confirmRemoveStall = () => {
    if (stallToRemove && editFormData) {
      const { index, stallNumber } = stallToRemove;
      
      setEditFormData(prev => prev ? ({ 
        ...prev, 
        allStalls: prev.allStalls.filter((_, i) => i !== index) 
      }) : null);
      
      showNotification(`Removed ${stallNumber} successfully.`, 'success');
      setShowDeleteStallModal(false);
      setStallToRemove(null);
    }
  };

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
      case 'upcoming': return 'success';
      case 'ongoing': return 'info';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'refunded': return 'error';
      default: return 'default';
    }
  };

  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleEdit = (event: Event) => {
    console.log('🔍 handleEdit called with event:', event);
    console.log('🏪 Event stalls data:', {
      inSiteStalls: event.inSiteStalls,
      allStalls: event.allStalls,
      noOfStalls: event.noOfStalls
    });
    console.log('🔍 Raw event object keys:', Object.keys(event));
    console.log('🔍 Event noOfStalls value:', event.noOfStalls);
    console.log('🔍 Event no_of_stalls value:', (event as any).no_of_stalls);
    console.log('🔍 Raw event object:', event);
    console.log('🔍 Database event object:', (event as any));
    setSelectedEvent(event);

    // Map Event to ExtendedEventFormData with default values for missing fields
    const editData = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      eventDate: event.date,
      eventEndDate: event.eventEndDate || '',
      eventTime: event.time,
      eventEndTime: event.eventEndTime || '',
      venueId: event.venueId || '',
      venueName: event.venue,
      city: event.city || '',
      maxCapacity: event.maxCapacity,
      planType: event.planType || 'Plan A',
      status: event.status,
      attendees: event.attendees,
      totalRevenue: event.totalRevenue,
      // Image Field
      eventImage: null,
      eventImageUrl: event.eventImageUrl || '',
      // Layout Image Field
      layoutImage: null,
      layoutImageUrl: event.layoutImageUrl || '',
      // Venue Facilities & Amenities
      venueFacilities: [],
      venueAmenities: [],
      // Selected Facilities & Amenities for Event
      selectedFacilities: [],
      selectedAmenities: [],
      // Stalls Configuration
      noOfStalls: event.noOfStalls || 0,
      stallSize: '',
      stallCategory: '',
      // Pricing & Availability
      pricePerHour: event.pricePerHour || 0,
      availableHours: event.availableHours || '',
      parkingSpaces: event.parkingSpaces || 0,
      cateringAllowed: event.cateringAllowed || false,
      alcoholAllowed: event.alcoholAllowed || false,
      smokingAllowed: event.smokingAllowed || false,
      // Unified stall config
      allStalls: (event.inSiteStalls || []).map((stall: any) => ({
        id: stall.id || Date.now().toString(),
        stallNo: stall.stallNo || '',
        stallSize: stall.stallSize || '',
        stallCategory: stall.stallCategory || '',
        price: stall.price || 0
      }))
    };

    console.log('📝 Mapped stalls data:', editData.allStalls);

    // Set selected vendors and exhibitors
    setSelectedVendors(event.vendors || []);
    setSelectedExhibitors(event.exhibitors || []);
    setSelectedExhibitorsForEdit(event.exhibitors || []);

    console.log('📝 Setting editFormData:', editData);
    console.log('📸 Current eventImageUrl:', event.eventImageUrl);

    setEditFormData(editData);
    setShowEditModal(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const validateEditForm = (): boolean => {
    if (!editFormData) return false;

    console.log('🔍 Starting validateEditForm with editFormData:', editFormData);

    const errors: { [key: string]: string } = {};

    // Title validation
    if (!editFormData.title.trim()) {
      errors.title = 'Event title is required';
    } else if (editFormData.title.trim().length < 3) {
      errors.title = 'Event title must be at least 3 characters';
    }

    // Description validation
    if (!editFormData.description.trim()) {
      errors.description = 'Event description is required';
    } else if (editFormData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    // Date validation
    if (!editFormData.eventDate) {
      errors.eventDate = 'Event start date is required';
    } else {
      const eventDate = new Date(editFormData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        errors.eventDate = 'Event start date cannot be in the past';
      }
    }

    // End date validation
    if (!editFormData.eventEndDate) {
      errors.eventEndDate = 'Event end date is required';
    } else if (editFormData.eventDate && editFormData.eventEndDate) {
      const startDate = new Date(editFormData.eventDate);
      const endDate = new Date(editFormData.eventEndDate);

      if (endDate < startDate) {
        errors.eventEndDate = 'Event end date cannot be before start date';
      }
    }

    // Time validation
    if (!editFormData.eventTime) {
      errors.eventTime = 'Event start time is required';
    }

    if (!editFormData.eventEndTime) {
      errors.eventEndTime = 'Event end time is required';
    }

    // Venue validation
    if (!editFormData.venueId) {
      errors.venueId = 'Please select a venue';
    }

    // City validation
    if (!editFormData.city.trim()) {
      errors.city = 'City is required';
    }

    // Capacity validation
    if (editFormData.maxCapacity < 10) {
      errors.maxCapacity = 'Maximum capacity must be at least 10';
    }

    // Stalls validation
    const configuredStalls = editFormData.allStalls.length;
    const plannedStalls = editFormData.noOfStalls || configuredStalls;
    
    if (plannedStalls < 1) {
      errors.noOfStalls = 'At least 1 stall is required';
    } else if (plannedStalls > 100) {
      errors.noOfStalls = 'Maximum 100 stalls allowed';
    } else if (configuredStalls > plannedStalls) {
      errors.noOfStalls = `You have ${configuredStalls} configured stalls but limit is set to ${plannedStalls}. Please manually remove ${configuredStalls - plannedStalls} excess stall(s) using the delete buttons below, then reduce the limit.`;
    }

    // Image validation - Make image optional for updates
    // Only require image if both current image and new image are missing
    if (!editFormData.eventImage && !editFormData.eventImageUrl) {
      // Don't require image for updates - it's optional
      // errors.eventImage = 'Event image is required';
    }

    console.log('❌ Validation errors found:', errors);
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      console.log('🔍 handleSaveEdit called with data:', editFormData);

      if (!validateEditForm()) {
        console.log('❌ Form validation failed');
        return;
      }

      let imageUrl = editFormData.eventImageUrl;

      // Upload image to Supabase storage if a new image is selected
      if (editFormData.eventImage) {
        console.log('📤 Uploading new image...');
        const fileExt = editFormData.eventImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, editFormData.eventImage);

        if (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          showNotification(`Image upload failed: ${uploadError.message}`, 'error');
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
        console.log('✅ Image uploaded successfully:', imageUrl);
      }

      let layoutImageUrl = editFormData.layoutImageUrl;

      // Upload layout image to Supabase storage if a new layout image is selected
      if (editFormData.layoutImage) {
        console.log('📤 Uploading new layout image...');
        const fileExt = editFormData.layoutImage.name.split('.').pop();
        const fileName = `layout_${Date.now()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, editFormData.layoutImage);

        if (uploadError) {
          console.error('❌ Layout image upload failed:', uploadError);
          showNotification(`Layout image upload failed: ${uploadError.message}`, 'error');
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        layoutImageUrl = urlData.publicUrl;
        console.log('✅ Layout image uploaded successfully:', layoutImageUrl);
      }

      // Sanitize status to match DB constraint
      const allowedStatuses = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];
      const normalizedStatus = editFormData.status === 'upcoming'
        ? 'published'
        : (allowedStatuses.includes(editFormData.status as any) ? editFormData.status : 'draft');

      const updateData = {
        title: editFormData.title,
        description: editFormData.description,
        event_date: editFormData.eventDate,
        event_end_date: editFormData.eventEndDate,
        event_time: editFormData.eventTime,
        event_end_time: editFormData.eventEndTime,
        venue_id: editFormData.venueId,
        venue_name: editFormData.venueName,
        city: editFormData.city,
        max_capacity: editFormData.maxCapacity,
        plan_type: editFormData.planType,
        status: normalizedStatus,
        attendees: editFormData.attendees,
        total_revenue: editFormData.totalRevenue,
        vendor_ids: selectedVendors,
        exhibitor_ids: selectedExhibitorsForEdit,
        // Image field
        event_image_url: imageUrl,
        // Layout image field
        layout_image_url: layoutImageUrl,
        // Pricing & Availability
        price_per_hour: editFormData.pricePerHour,
        available_hours: editFormData.availableHours,
        parking_spaces: editFormData.parkingSpaces,
        catering_allowed: editFormData.cateringAllowed,
        alcohol_allowed: editFormData.alcoholAllowed,
        smoking_allowed: editFormData.smokingAllowed,
        // Stalls Configuration
        no_of_stalls: editFormData.noOfStalls,
        in_site_stalls: editFormData.allStalls, // Store as JSONB array
        all_stalls: editFormData.allStalls.map(stall => stall.stallNo) // Store stall numbers as string array
      };

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', editFormData.id);

      if (error) {
        console.error('❌ Update failed:', error);
        showNotification('Failed to update event: ' + error.message, 'error');
      } else {
        console.log('✅ Update successful');
        showNotification('Event updated successfully!', 'success');
        setShowEditModal(false);
        setEditFormData(null);
        setSelectedEvent(null);
        refetch();
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEvent) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) {
        showNotification('Failed to delete event: ' + error.message, 'error');
      } else {
        showNotification('Event deleted successfully!', 'success');
        setShowDeleteModal(false);
        setSelectedEvent(null);
        refetch();
      }
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDeleteStallModal(false);
    setSelectedEvent(null);
    setEditFormData(null);
    setEditErrors({});
    setEditActiveTab('event');
    setViewActiveTab('event');
    setSelectedExhibitorsForEdit([]);
    setExhibitorSearchTerm('');
    setStallToRemove(null);
  };

  // Exhibitor selection handlers for edit modal
  const toggleExhibitorSelectionEdit = (exhibitorId: string) => {
    setSelectedExhibitorsForEdit(prev =>
      prev.includes(exhibitorId)
        ? prev.filter(id => id !== exhibitorId)
        : [...prev, exhibitorId]
    );
  };

  const selectAllExhibitorsEdit = (checked: boolean) => {
    if (checked) {
      setSelectedExhibitorsForEdit(exhibitors.map(e => e.id));
    } else {
      setSelectedExhibitorsForEdit([]);
    }
  };

  // Status update handler
  const updateExhibitorStatusEdit = async (exhibitorId: string, newStatus: string) => {
    // try {
    //   const { error } = await supabase
    //     .from('exhibitors')
    //     .update({ status: newStatus })
    //     .eq('id', exhibitorId);

    //   if (error) {
    //     console.error('Error updating exhibitor status:', error);
    //     showNotification('Failed to update status: ' + error.message, 'error');
    //   } else {
    //     // You may want to refresh exhibitors data here
    //     console.log('Exhibitor status updated successfully');
    //     showNotification('Status updated successfully!', 'success');
    //     // Force refresh of exhibitors data
    //     window.location.reload(); // Quick fix - reload the page
    //     // OR better: refetch exhibitors data specifically
    //     refetch();
    //   }
    // } catch (err) {
    //   console.error('Error updating exhibitor status:', err);
    //   showNotification('Error updating status', 'error');
    // }

    try {
      // Update local state immediately for UI responsiveness
      setExhibitorUpdates(prev => ({ ...prev, [exhibitorId]: newStatus }));

      const { error } = await supabase
        .from('exhibitors')
        .update({ status: newStatus })
        .eq('id', exhibitorId);

      if (error) {
        console.error('Error updating exhibitor status:', error);
        showNotification('Failed to update status: ' + error.message, 'error');
        // Revert local state on error
        setExhibitorUpdates(prev => ({ ...prev, [exhibitorId]: exhibitors.find(e => e.id === exhibitorId)?.status || 'pending' }));
      } else {
        showNotification('Status updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Error updating exhibitor status:', err);
      showNotification('Error updating status', 'error');
    }
  };

  const handleImageUpload = (file: File) => {
    console.log('📸 handleImageUpload called with file:', file);
    if (!editFormData) {
      console.log('❌ No editFormData available');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      setEditErrors(prev => ({ ...prev, eventImage: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      setEditErrors(prev => ({ ...prev, eventImage: 'Image size must be less than 5MB' }));
      return;
    }

    console.log('✅ File validation passed, updating editFormData');
    const objectUrl = URL.createObjectURL(file);
    console.log('🔗 Created object URL:', objectUrl);

    setEditFormData(prev => {
      const newData = prev ? {
        ...prev,
        eventImage: file,
        eventImageUrl: objectUrl
      } : null;
      console.log('📝 Updated editFormData:', newData);
      return newData;
    });

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

  const handleLayoutImageUpload = (file: File) => {
    console.log('📸 handleLayoutImageUpload called with file:', file);
    if (!editFormData) {
      console.log('❌ No editFormData available');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      setEditErrors(prev => ({ ...prev, layoutImage: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      setEditErrors(prev => ({ ...prev, layoutImage: 'Image size must be less than 5MB' }));
      return;
    }

    console.log('✅ Layout image validation passed, updating editFormData');
    const objectUrl = URL.createObjectURL(file);
    console.log('🔗 Created object URL:', objectUrl);

    setEditFormData(prev => {
      const newData = prev ? {
        ...prev,
        layoutImage: file,
        layoutImageUrl: objectUrl
      } : null;
      console.log('📝 Updated editFormData with layout image:', newData);
      return newData;
    });

    // Clear error
    if (editErrors.layoutImage) {
      setEditErrors(prev => ({ ...prev, layoutImage: '' }));
    }
  };

  const removeLayoutImage = () => {
    if (!editFormData) return;

    setEditFormData(prev => prev ? ({
      ...prev,
      layoutImage: null,
      layoutImageUrl: ''
    }) : null);
  };

  // Notification function
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full ${type === 'success' ? 'bg-green-500 text-white' :
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
              <option value="upcoming">Upcoming</option>
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
          {['all', 'draft', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors duration-200 ${filter === status
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
              {/* <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Advanced Filter</span>
              </Button> */}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="hidden sm:table-cell">Date & Time</TableHead>
                  <TableHead className="hidden md:table-cell">Venue</TableHead>
                  {/* <TableHead>Attendees</TableHead> */}
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="hidden lg:table-cell">Revenue</TableHead> */}
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
                    {/* <TableCell>
                      <div className="flex items-center">
                        <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(event.attendees / event.maxCapacity) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{event.attendees}/{event.maxCapacity}</span>
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <Badge variant={getStatusVariant(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="hidden lg:table-cell font-medium">₹{event.totalRevenue.toLocaleString()}</TableCell> */}
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setViewActiveTab('event')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${viewActiveTab === 'event'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <CalendarIcon className="h-4 w-4 inline mr-2" />
                    Event Details
                  </button>
                  {/* <button
                    onClick={() => setViewActiveTab('exhibitor')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${viewActiveTab === 'exhibitor'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Exhibitors ({selectedEvent.exhibitors?.length || 0})
                  </button> */}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {viewActiveTab === 'event' && (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Basic Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                    <p className="text-gray-900">{selectedEvent.title}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-gray-900">{selectedEvent.description || 'No description provided'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Start Date</label>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-900">{selectedEvent.date}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event End Date</label>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-900">{selectedEvent.eventEndDate || 'Same day'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Start Time</label>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-900">{selectedEvent.time}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event End Time</label>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-900">{selectedEvent.eventEndTime || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-900">{selectedEvent.venue}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <p className="text-gray-900">{selectedEvent.city || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Event Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Event Configuration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Capacity</label>
                      <p className="text-gray-900">{selectedEvent.maxCapacity} people</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(selectedEvent.status)} className="text-sm">
                          {selectedEvent.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    Event Images
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEvent.eventImageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
                        <img
                          src={selectedEvent.eventImageUrl}
                          alt="Event"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {selectedEvent.layoutImageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Layout Image</label>
                        <img
                          src={selectedEvent.layoutImageUrl}
                          alt="Layout"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendors Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Selected Vendors
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {selectedEvent.vendors && selectedEvent.vendors.length > 0 ? (
                      selectedEvent.vendors.map((vendorId: string, index: number) => (
                        <div key={index} className="text-sm text-gray-900 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                          <span className="font-medium">{getVendorName(vendorId)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        No vendors selected
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Exhibitors Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Selected Exhibitors
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {selectedEvent.exhibitors && selectedEvent.exhibitors.length > 0 ? (
                      selectedEvent.exhibitors.map((exhibitorId: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {getExhibitorName(exhibitorId)}
                            </div>
                          </div>
                          {/* <Badge variant="success" className="text-xs">
                            <Check className="h-4 w-4" />
                          </Badge> */}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                        <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">No exhibitors selected</p>
                        <p className="text-xs text-gray-500">Exhibitors can be assigned when editing the event</p>
                      </div>
                    )}
                  </div>
                </div>



                {/* Stalls Configuration */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Stalls Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Number of Stalls</label>
                      <p className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const plannedStalls = selectedEvent.noOfStalls || 0;
                          const configuredStalls = selectedEvent.allStalls?.length || 0;
                          // If no planned stalls but have configured stalls, use configured count as total
                          return plannedStalls > 0 ? plannedStalls : configuredStalls;
                        })()}
                      </p>
                      <p className="text-xs text-gray-500">Total planned stalls</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Configured Stalls</label>
                      <p className="text-2xl font-bold text-green-600">{selectedEvent.allStalls?.length || 0}</p>
                      <p className="text-xs text-gray-500">Stalls set up</p>
                    </div>
                    {/* <div>
                    <label className="text-sm font-medium text-gray-700">Remaining Stalls</label>
                    <p className="text-2xl font-bold text-orange-600">
                      {(() => {
                        const plannedStalls = selectedEvent.noOfStalls || 0;
                        const configuredStalls = selectedEvent.allStalls?.length || 0;
                        const totalStalls = plannedStalls > 0 ? plannedStalls : configuredStalls;
                        return Math.max(0, totalStalls - configuredStalls);
                      })()}
                    </p>
                    <p className="text-xs text-gray-500">Yet to configure</p>
                  </div> */}
                  </div>


                  {selectedEvent.allStalls && selectedEvent.allStalls.length > 0 ? (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Stalls Details</label>

                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        <div className="divide-y divide-gray-100">
                          {selectedEvent.allStalls.map((stall: any, index: number) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50">
                              <div className="flex items-center space-x-4 min-w-0 flex-1">
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                    {stall.stallNo || stall.stall_no || `S${index + 1}`}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex-shrink-0">
                                      <span className="text-gray-500">Size:</span>
                                      <span className="ml-1 font-medium text-gray-900">
                                        {stall.stallSize || stall.stall_size || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="text-gray-500">Category:</span>
                                      <span className="ml-1 font-medium text-gray-900">
                                        {stall.stallCategory || stall.stall_category || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ₹{(stall.price || stall.stall_price || 0)?.toLocaleString?.() || stall.price || stall.stall_price || '0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : selectedEvent.inSiteStalls && selectedEvent.inSiteStalls.length > 0 ? (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Stalls Details (from inSiteStalls)</label>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        <div className="divide-y divide-gray-100">
                          {selectedEvent.inSiteStalls.map((stall: any, index: number) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50">
                              <div className="flex items-center space-x-4 min-w-0 flex-1">
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                    {stall.stallNo || stall.stall_no || `S${index + 1}`}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex-shrink-0">
                                      <span className="text-gray-500">Size:</span>
                                      <span className="ml-1 font-medium text-gray-900">
                                        {stall.stallSize || stall.stall_size || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="text-gray-500">Category:</span>
                                      <span className="ml-1 font-medium text-gray-900">
                                        {stall.stallCategory || stall.stall_category || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ₹{(stall.price || stall.stall_price || 0)?.toLocaleString?.() || stall.price || stall.stall_price || '0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">No stalls configured for this event.</p>
                    </div>
                  )}
                </div>

                {/* Vendors & Exhibitors */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedEvent.vendors && selectedEvent.vendors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Vendors</h3>
                      <div className="space-y-2">
                        {selectedEvent.vendors.map((vendorId: string, index: number) => (
                          <div key={index} className="text-sm text-gray-900 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                            <span className="font-medium">{getVendorName(vendorId)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.exhibitors && selectedEvent.exhibitors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Exhibitors</h3>
                      <div className="space-y-2">
                        {selectedEvent.exhibitors.map((exhibitorId: string, index: number) => (
                          <div key={index} className="text-sm text-gray-900 bg-green-50 px-3 py-2 rounded border border-green-200">
                            <span className="font-medium">{getExhibitorName(exhibitorId)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div> */}
              </div>
            )}

          </div>

          {/* Exhibitor Tab */}
          {/* {viewActiveTab === 'exhibitor' && (
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Navigation Header 
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Event Exhibitors</h3>
                  <p className="text-sm text-gray-600">
                    View all exhibitors for this event. Currently {exhibitors.filter(exhibitor => selectedEvent.exhibitors?.includes(exhibitor.id)).length} exhibitor(s) assigned.
                  </p>
                </div>
              </div>

              {/* Search Bar 
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search exhibitors by company, name, email, or phone..."
                  value={exhibitorSearchTerm}
                  onChange={(e) => setExhibitorSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {exhibitorSearchTerm && (
                  <button
                    onClick={() => setExhibitorSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Selection Summary
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-blue-700">
                    <strong>{exhibitors.filter(exhibitor => selectedEvent.exhibitors?.includes(exhibitor.id)).length}</strong> exhibitor(s) assigned to this event
                  </p>
                  {exhibitorSearchTerm && (
                    <p className="text-xs text-gray-600">
                      Showing {exhibitors.filter((exhibitor) => {
                        if (!selectedEvent.exhibitors?.includes(exhibitor.id)) return false;
                        if (!exhibitorSearchTerm) return true;
                        const searchLower = exhibitorSearchTerm.toLowerCase();
                        return (
                          (exhibitor.companyName || '').toLowerCase().includes(searchLower) ||
                          (exhibitor.firstName || '').toLowerCase().includes(searchLower) ||
                          (exhibitor.lastName || '').toLowerCase().includes(searchLower) ||
                          (exhibitor.email || '').toLowerCase().includes(searchLower) ||
                          (exhibitor.phone || '').toLowerCase().includes(searchLower) ||
                          (exhibitor.category || '').toLowerCase().includes(searchLower)
                        );
                      }).length} of {exhibitors.filter(exhibitor => selectedEvent.exhibitors?.includes(exhibitor.id)).length} assigned exhibitors
                  </p>
                  )}
                </div>
              </div>

              {/* Exhibitors Table 
              <div className="overflow-x-auto">
                {!exhibitors || exhibitors.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No exhibitors found</p>
                    <p className="text-sm text-gray-500">Add exhibitors to see them here</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Person
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {exhibitors
                        .filter((exhibitor) => {
                          if (!selectedEvent.exhibitors?.includes(exhibitor.id)) return false;
                          if (!exhibitorSearchTerm) return true;
                          const searchLower = exhibitorSearchTerm.toLowerCase();
                          return (
                            (exhibitor.companyName || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.firstName || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.lastName || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.email || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.phone || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.category || '').toLowerCase().includes(searchLower)
                          );
                        })
                        .map((exhibitor) => (
                          <tr key={exhibitor.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {exhibitor.companyName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900">
                                {`${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim() || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900">{exhibitor.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900">{exhibitor.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900">{exhibitor.category || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={exhibitor.status === 'confirmed' || exhibitor.status === 'checked_in' ? 'success' : 'default'}>
                                {exhibitor.status === 'confirmed' || exhibitor.status === 'checked_in' ? 'Confirmed' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900">
                                {exhibitor.paymentStatus === 'pending' ? 'Pending' :
                                  exhibitor.paymentStatus === 'paid' ? 'Paid' :
                                    exhibitor.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )} */}

          {/* <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <Button variant="outline" onClick={closeModals}>Close</Button>
            <Button onClick={() => { closeModals(); handleEdit(selectedEvent); }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          </div> */}
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setEditActiveTab('event')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${editActiveTab === 'event'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <CalendarIcon className="h-4 w-4 inline mr-2" />
                    Event
                  </button>
                  <button
                    onClick={() => setEditActiveTab('exhibitor')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${editActiveTab === 'exhibitor'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Exhibitor
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {editActiveTab === 'event' && (
              <div className="p-6 space-y-6 overflow-y-auto"> {/* max-h-[70vh] */}
                {/* Selection Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Event Summary
                  </h3>

                  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Selected Vendors</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedVendors.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditActiveTab('exhibitor')}
                      className="mt-2 w-full text-xs"
                    >
                      Manage Vendors
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Selected Exhibitors</p>
                        <p className="text-2xl font-bold text-green-600">{selectedExhibitorsForEdit.length}</p>
                      </div>
                      <User className="h-8 w-8 text-green-400" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditActiveTab('exhibitor')}
                      className="mt-2 w-full text-xs"
                    >
                      Manage Exhibitors
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Configured Stalls</p>
                        <p className="text-2xl font-bold text-purple-600">{editFormData.allStalls.length}</p>
                      </div>
                      <Building2 className="h-8 w-8 text-purple-400" />
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      {editFormData.noOfStalls || editFormData.allStalls.length} total planned
                    </p>
                  </div>
                </div> */}
                </div>

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
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {editErrors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {editErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {editErrors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {editErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Start Date *</label>
                      <input
                        type="date"
                        value={editFormData.eventDate}
                        onChange={(e) => setEditFormData({ ...editFormData, eventDate: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.eventDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                      />
                      {editErrors.eventDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {editErrors.eventDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event End Date *</label>
                      <input
                        type="date"
                        value={editFormData.eventEndDate}
                        onChange={(e) => setEditFormData({ ...editFormData, eventEndDate: e.target.value })}
                        min={editFormData.eventDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.eventEndDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                      />
                      {editErrors.eventEndDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {editErrors.eventEndDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Start Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          value={editFormData.eventTime}
                          onChange={(e) => setEditFormData({ ...editFormData, eventTime: e.target.value })}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.eventTime ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                      </div>
                      {editErrors.eventTime && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {editErrors.eventTime}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event End Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          value={editFormData.eventEndTime}
                          onChange={(e) => setEditFormData({ ...editFormData, eventEndTime: e.target.value })}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.eventEndTime ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                      </div>
                      {editErrors.eventEndTime && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {editErrors.eventEndTime}
                        </p>
                      )}
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
                            {venue.name} - {venue.location ? venue.location : venue.city}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Event Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Event Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Capacity</label>
                        <input
                          type="number"
                          value={editFormData.maxCapacity}
                          onChange={(e) => setEditFormData({ ...editFormData, maxCapacity: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Maximum attendees"
                          min="10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Status</label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="draft">Draft</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
                      <select
                        value={editFormData.planType}
                        onChange={(e) => setEditFormData({...editFormData, planType: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Plan A">Plan A</option>
                        <option value="Plan B">Plan B</option>
                        <option value="Plan C">Plan C</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div> */}

                      {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
                      <input
                        type="number"
                        value={editFormData.attendees}
                        onChange={(e) => setEditFormData({...editFormData, attendees: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Number of attendees"
                      />
                    </div> */}

                      {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Revenue</label>
                      <input
                        type="number"
                        value={editFormData.totalRevenue}
                        onChange={(e) => setEditFormData({...editFormData, totalRevenue: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Total revenue"
                      />
                    </div> */}
                    </div>
                  </div>
                </div>

                {/* Pricing & Availability */}
                {/* <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2" />
                  Pricing & Availability
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Hour</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={editFormData.pricePerHour}
                        onChange={(e) => setEditFormData({...editFormData, pricePerHour: Number(e.target.value)})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter price per hour"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Hours</label>
                    <input
                      type="text"
                      value={editFormData.availableHours}
                      onChange={(e) => setEditFormData({...editFormData, availableHours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 9:00 AM - 11:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parking Spaces</label>
                    <input
                      type="number"
                      value={editFormData.parkingSpaces}
                      onChange={(e) => setEditFormData({...editFormData, parkingSpaces: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Number of parking spaces"
                      min="0"
                    />
                  </div>
                </div>

                <div className="hidden">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Event Policies</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editFormData.cateringAllowed}
                        onChange={(e) => setEditFormData({...editFormData, cateringAllowed: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Catering Allowed</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editFormData.alcoholAllowed}
                        onChange={(e) => setEditFormData({...editFormData, alcoholAllowed: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Alcohol Allowed</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editFormData.smokingAllowed}
                        onChange={(e) => setEditFormData({...editFormData, smokingAllowed: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Smoking Allowed</span>
                    </label>
                  </div>
                </div>
              </div> */}

                {/* Event Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    Event Flyers
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Flyers</label>
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
                                Click to upload event flyers
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

                {/* Layout Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    Upload Layout
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stall Layout Image</label>
                    <div className="space-y-4">
                      {editFormData.layoutImageUrl ? (
                        <div className="relative">
                          <img
                            src={editFormData.layoutImageUrl}
                            alt="Layout preview"
                            className="w-full h-64 object-contain rounded-lg border border-gray-300 bg-gray-50"
                          />
                          <button
                            type="button"
                            onClick={removeLayoutImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="mt-2 text-sm text-gray-600">
                            Layout image: {editFormData.layoutImage?.name || 'Current layout image'}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLayoutImageUpload(file);
                            }}
                            className="hidden"
                            id="edit-layout-image-upload"
                          />
                          <label
                            htmlFor="edit-layout-image-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <Upload className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Click to upload layout image
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                      {editErrors.layoutImage && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {editErrors.layoutImage}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload an image showing the stall layout structure for this event. This helps exhibitors understand the venue arrangement.
                    </p>
                  </div>
                </div>

                {/* Vendors Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Select Vendors
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {vendors.map(vendor => (
                      <label key={vendor.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor.id)}
                          onChange={() => toggleVendor(vendor.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 truncate">{vendor.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Selected: {selectedVendors.length} vendor(s)
                  </p>
                </div>

                {/* Selected Exhibitors Display */}
                {/* <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Exhibitors
                  </h3>

                  {selectedExhibitorsForEdit.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {selectedExhibitorsForEdit.length} exhibitor(s) selected for this event
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditActiveTab('exhibitor')}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Manage Exhibitors
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                        {exhibitors
                          .filter(exhibitor => selectedExhibitorsForEdit.includes(exhibitor.id))
                          .map(exhibitor => (
                            <div key={exhibitor.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                  {exhibitor.companyName || `${exhibitor.firstName} ${exhibitor.lastName}`}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {exhibitor.category || 'N/A'} • {exhibitor.status || 'pending'}
                                </div>
                              </div>
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="h-4 w-4" />
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">No exhibitors selected</p>
                      <p className="text-xs text-gray-500 mb-3">Go to the Exhibitor tab to select exhibitors for this event</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditActiveTab('exhibitor')}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Select Exhibitors
                      </Button>
                    </div>
                  )}
                </div> */}

                {/* Exhibitors Selection */}
                {/* <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Select Exhibitors
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {exhibitors.map(exhibitor => (
                    <label key={exhibitor.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedExhibitors.includes(exhibitor.id)}
                        onChange={() => toggleExhibitor(exhibitor.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 truncate">{exhibitor.companyName}</span>
                    </label>
                  ))}
                </div> 
                <p className="text-sm text-gray-500">
                  Selected: {selectedExhibitors.length} exhibitor(s)
                </p>
              </div>*/}

                {/* Stalls Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Stalls Configuration
                  </h3>
                  
                  {/* Mismatch Warning Banner */}
                  {editFormData.allStalls.length > 0 && (editFormData.noOfStalls || editFormData.allStalls.length) !== editFormData.allStalls.length && (
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-800 mb-1">
                            Stall Count Mismatch Detected
                          </h4>
                          <div className="text-sm text-red-700 mb-2">
                            <strong>Configured:</strong> {editFormData.allStalls.length} stalls | 
                            <strong> Planned:</strong> {editFormData.noOfStalls || editFormData.allStalls.length} stalls
                          </div>
                          <div className="text-sm text-red-600">
                            {editFormData.allStalls.length > (editFormData.noOfStalls || editFormData.allStalls.length) 
                              ? `⚠️ You have ${editFormData.allStalls.length - (editFormData.noOfStalls || editFormData.allStalls.length)} excess stall(s). Please remove them manually using the delete buttons below, then reduce the planned count.`
                              : `⚠️ You need ${(editFormData.noOfStalls || editFormData.allStalls.length) - editFormData.allStalls.length} more stall(s). Please add them or reduce the planned count.`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Stalls</label>
                    <input
                      type="number"
                      value={editFormData.noOfStalls || editFormData.allStalls.length}
                      onChange={(e) => handleStallCountChange(parseInt(e.target.value) || 0)}
                      className={`w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        editErrors.noOfStalls ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min="1"
                      max="100"
                    />
                    {editErrors.noOfStalls && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {editErrors.noOfStalls}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Configured stalls: {editFormData.allStalls.length} / {editFormData.noOfStalls || editFormData.allStalls.length}
                      </p>
                      <p className="text-xs text-gray-400">
                        Min: 1 | Max: 100
                      </p>
                    </div>
                    
                    {/* Validation warning */}
                    {editFormData.allStalls.length > 0 && (editFormData.noOfStalls || editFormData.allStalls.length) !== editFormData.allStalls.length && (
                      <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-800 mb-1">
                            ⚠️ Stall Count Mismatch
                          </div>
                          <div className="text-sm text-red-700">
                            <strong>Configured Stalls:</strong> {editFormData.allStalls.length} | 
                            <strong> Planned Stalls:</strong> {editFormData.noOfStalls || editFormData.allStalls.length}
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            {editFormData.allStalls.length > (editFormData.noOfStalls || editFormData.allStalls.length) 
                              ? `You have ${editFormData.allStalls.length - (editFormData.noOfStalls || editFormData.allStalls.length)} excess stall(s). Please remove them manually using the delete buttons below.`
                              : `You need ${(editFormData.noOfStalls || editFormData.allStalls.length) - editFormData.allStalls.length} more stall(s). Add them or reduce the limit.`
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Stall Status Summary */}
                    <div className={`p-3 border rounded-lg ${
                      editFormData.allStalls.length > 0 && (editFormData.noOfStalls || editFormData.allStalls.length) !== editFormData.allStalls.length
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`text-sm font-semibold ${
                            editFormData.allStalls.length > 0 && (editFormData.noOfStalls || editFormData.allStalls.length) !== editFormData.allStalls.length
                              ? 'text-red-900'
                              : 'text-blue-900'
                          }`}>
                            Stalls Status
                          </h4>
                          <div className={`text-xs mt-1 ${
                            editFormData.allStalls.length > 0 && (editFormData.noOfStalls || editFormData.allStalls.length) !== editFormData.allStalls.length
                              ? 'text-red-700'
                              : 'text-blue-700'
                          }`}>
                            <span className="font-medium">{editFormData.allStalls.length}</span> configured / 
                            <span className="font-medium"> {editFormData.noOfStalls || editFormData.allStalls.length}</span> planned
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs">
                            {editFormData.allStalls.length === 0 ? (
                              <span className="text-orange-600">⚠️ No stalls configured</span>
                            ) : editFormData.allStalls.length === (editFormData.noOfStalls || editFormData.allStalls.length) ? (
                              <span className="text-green-600">✅ All stalls configured</span>
                            ) : editFormData.allStalls.length > (editFormData.noOfStalls || editFormData.allStalls.length) ? (
                              <span className="text-red-600">❌ {editFormData.allStalls.length - (editFormData.noOfStalls || editFormData.allStalls.length)} excess stalls</span>
                            ) : (
                              <span className="text-blue-600">📝 {((editFormData.noOfStalls || editFormData.allStalls.length) - editFormData.allStalls.length)} more needed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">
                        Configure Stalls
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                        onClick={addStall}
                        disabled={(editFormData.noOfStalls || editFormData.allStalls.length) > 0 && editFormData.allStalls.length >= (editFormData.noOfStalls || editFormData.allStalls.length)}
                      >
                        <span>+ Add Stall</span>
                      </Button>
                    </div>

                    {(editFormData.noOfStalls || editFormData.allStalls.length) > 0 && editFormData.allStalls.length >= (editFormData.noOfStalls || editFormData.allStalls.length) && (
                      <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-700">
                          Maximum stalls limit reached ({editFormData.allStalls.length}/{editFormData.noOfStalls || editFormData.allStalls.length})
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {editFormData.allStalls.map((row, idx) => (
                        <div key={row.id} className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-center mb-3">
                            <Badge variant="default" className="mr-2">#{idx + 1}</Badge>
                            <span className="text-xs text-gray-500">Stall</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-y-3 gap-x-0 items-end space-x-2">
                            {/* Stall No */}
                            <div>
                              <label htmlFor={`stall-stallNo-${row.id}`} className="block text-xs text-gray-600 mb-1">Stall No.</label>
                              <input
                                id={`stall-stallNo-${row.id}`}
                                type="text"
                                value={row.stallNo}
                                onChange={(e) => updateStall(idx, 'stallNo', e.target.value)}
                                placeholder="e.g., A1"
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>

                            {/* Stall Size */}
                            <div>
                              <label htmlFor={`stall-stallSize-${row.id}`} className="block text-xs text-gray-600 mb-1">Size</label>
                              <select
                                id={`stall-stallSize-${row.id}`}
                                value={row.stallSize}
                                onChange={(e) => updateStall(idx, 'stallSize', e.target.value)}
                                className="w-full px-3 py-2 border rounded max-w-60 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                <option value="">Select</option>
                                <option value="Small (6x6 ft)">Small (6x6 ft)</option>
                                <option value="Medium (8x8 ft)">Medium (8x8 ft)</option>
                                <option value="Large (10x10 ft)">Large (10x10 ft)</option>
                                <option value="Extra Large (12x12 ft)">Extra Large (12x12 ft)</option>
                                <option value="Custom">Custom</option>
                              </select>
                            </div>

                            {/* Category */}
                            <div>
                              <label htmlFor={`stall-stallCategory-${row.id}`} className="block text-sm text-gray-600 mb-1">Category</label>
                              <select
                                id={`stall-stallCategory-${row.id}`}
                                value={row.stallCategory}
                                onChange={(e) => updateStall(idx, 'stallCategory', e.target.value)}
                                className="w-full px-3 py-2 border rounded max-w-60 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                <option value="">Select</option>
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

                            {/* Price */}
                            <div>
                              <label htmlFor={`stall-price-${row.id}`} className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                              <input
                                id={`stall-price-${row.id}`}
                                type="text"
                                value={row.price}
                                onChange={(e) => updateStall(idx, 'price', e.target.value)}
                                placeholder="e.g., 1500"
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>

                            {/* Delete Button */}
                            <div className="flex justify-start">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeStall(idx)}
                                className="h-[40px]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {editFormData.allStalls.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No stalls configured. Click "Add Stall" to get started.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Exhibitor Tab */}
            {editActiveTab === 'exhibitor' && (
              <div className="p-6 space-y-6 overflow-y-auto"> {/* max-h-[70vh] */}
                {/* Navigation Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Manage Event Exhibitors</h3>
                    <p className="text-sm text-gray-600">
                      Select and manage interested exhibitors for this event. Currently {selectedExhibitorsForEdit.length} exhibitor(s) selected.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditActiveTab('event')}
                    className="flex items-center space-x-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>Back to Event</span>
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search exhibitors by company, name, email, or phone..."
                    value={exhibitorSearchTerm}
                    onChange={(e) => setExhibitorSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {exhibitorSearchTerm && (
                    <button
                      onClick={() => setExhibitorSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Selection Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-blue-700">
                      <strong>{selectedExhibitorsForEdit.length}</strong> exhibitor(s) selected for this event
                    </p>
                    {exhibitorSearchTerm && (
                      <p className="text-xs text-gray-600">
                        {(() => {
                          const interestedExhibitors = exhibitors.filter(exhibitor => 
                            (exhibitorUpdates[exhibitor.id] || exhibitor.status) === 'interested'
                          );
                          const filteredExhibitors = interestedExhibitors.filter((exhibitor) => {
                          const searchLower = exhibitorSearchTerm.toLowerCase();
                          return (
                            (exhibitor.companyName || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.firstName || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.lastName || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.email || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.phone || '').toLowerCase().includes(searchLower) ||
                            (exhibitor.category || '').toLowerCase().includes(searchLower)
                          );
                          });
                          return `Showing ${filteredExhibitors.length} of ${interestedExhibitors.length} interested exhibitors`;
                        })()}
                      </p>
                    )}
                  </div>
                  {/* <p className="text-xs text-blue-600 mt-2">
                    Only exhibitors with "interested" status are displayed in this list
                  </p> */}
                </div>

                {/* Exhibitors Table */}
                <div className="overflow-x-auto">
                  {(() => {
                    // Filter exhibitors to only show those with "interested" status
                    const interestedExhibitors = exhibitors.filter(exhibitor => 
                      (exhibitorUpdates[exhibitor.id] || exhibitor.status) === 'interested'
                    );
                    
                    // Apply search filter on top of status filter
                    const filteredExhibitors = interestedExhibitors.filter((exhibitor) => {
                                  if (!exhibitorSearchTerm) return true;
                                  const searchLower = exhibitorSearchTerm.toLowerCase();
                                  return (
                                    (exhibitor.companyName || '').toLowerCase().includes(searchLower) ||
                                    (exhibitor.firstName || '').toLowerCase().includes(searchLower) ||
                                    (exhibitor.lastName || '').toLowerCase().includes(searchLower) ||
                                    (exhibitor.email || '').toLowerCase().includes(searchLower) ||
                                    (exhibitor.phone || '').toLowerCase().includes(searchLower) ||
                                    (exhibitor.category || '').toLowerCase().includes(searchLower)
                                  );
                                });

                    if (interestedExhibitors.length === 0) {
                                  return (
                        <div className="text-center py-8">
                          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No interested exhibitors found</p>
                          <p className="text-sm text-gray-500">Only exhibitors with "interested" status are shown here</p>
                        </div>
                      );
                    }

                    if (filteredExhibitors.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No exhibitors match your search</p>
                          <p className="text-sm text-gray-500">Try adjusting your search terms</p>
                        </div>
                      );
                    }

                    return (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={filteredExhibitors.length > 0 &&
                                  filteredExhibitors.every(ex => selectedExhibitorsForEdit.includes(ex.id))}
                                onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedExhibitorsForEdit(prev => [
                                    ...new Set([...prev, ...filteredExhibitors.map(ex => ex.id)])
                                  ]);
                                } else {
                                  setSelectedExhibitorsForEdit(prev =>
                                    prev.filter(id => !filteredExhibitors.find(ex => ex.id === id))
                                  );
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Person
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {filteredExhibitors.map((exhibitor) => (
                            <tr key={exhibitor.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedExhibitorsForEdit.includes(exhibitor.id)}
                                  onChange={() => toggleExhibitorSelectionEdit(exhibitor.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {exhibitor.companyName || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-900">
                                  {`${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim() || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-900">{exhibitor.email || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-900">{exhibitor.phone || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-900">{exhibitor.category || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={exhibitorUpdates[exhibitor.id] || exhibitor.status}
                                  onChange={(e) => updateExhibitorStatusEdit(exhibitor.id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="interested">Interested</option>
                                  <option value="approved">Approved</option>
                                  <option value="declined">Declined</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-900">
                                  <Badge variant={getPaymentStatusVariant(exhibitor.paymentStatus)} className="w-20 justify-center font-xs">
                                    {exhibitor.paymentStatus || 'PENDING'}
                                  </Badge>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={closeModals}>Cancel</Button>
              <Button onClick={handleSaveEdit} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
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
                <Button variant="danger" onClick={handleConfirmDelete} className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Event</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Stall Confirmation Modal */}
      {showDeleteStallModal && stallToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Remove Stall</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to remove "<strong>{stallToRemove.stallNumber}</strong>"?
                This will permanently remove the stall configuration.
              </p>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteStallModal(false);
                    setStallToRemove(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={confirmRemoveStall} 
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Stall</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};