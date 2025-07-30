import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, Users, Calendar, DollarSign, Search, Filter, X, Save, AlertTriangle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
// import { mockVenues } from '../data/mockData';
import { Venue } from '../types';
import { supabase } from '../lib/supabase';
import { useVenues } from '../hooks/useSupabaseData';

interface ExtendedVenueFormData {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  memberCount: number;
  facilities: string[];
  amenities: string[];
  status: 'active' | 'inactive' | 'pending';
  // Extended fields
  addressLine1?: string;
  addressLandmark?: string;
  addressStandard?: string;
  areaSqFt?: number;
  kindOfSpace?: string;
  isCovered?: boolean;
  pricingPerDay?: number;
  facilityAreaSqFt?: number;
  noOfStalls?: number;
  facilityCovered?: boolean;
  noOfFlats?: number;
  // Google Maps fields
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  // Custom Contact Information
  customContacts?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  }>;
}

export const Venues: React.FC = () => {
  const { venues, loading, error, refetch } = useVenues();
  
  const [localVenues, setLocalVenues] = useState<Venue[]>([]); // for local UI updates if needed
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Venue | null>(null);

  const filteredVenues = venues.filter(venue => {
    const matchesFilter = filter === 'all' || venue.status === filter;
    const matchesSearch = searchTerm === '' || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const handleView = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowViewModal(true);
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setEditFormData({ ...venue });
    setShowEditModal(true);
  };

  const handleDelete = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowDeleteModal(true);
  };

  const checkForDuplicates = async (excludeId?: string): Promise<{ hasDuplicates: boolean; message: string }> => {
    if (!editFormData) return { hasDuplicates: false, message: '' };

    try {
      // Check for duplicate venue names
      let nameQuery = supabase
        .from('venues')
        .select('id, name')
        .ilike('name', editFormData.name.trim());

      if (excludeId) {
        nameQuery = nameQuery.neq('id', excludeId);
      }

      const { data: nameDuplicates, error: nameError } = await nameQuery;

      if (nameError) throw nameError;

      if (nameDuplicates && nameDuplicates.length > 0) {
        return {
          hasDuplicates: true,
          message: `A venue with the name "${editFormData.name}" already exists. Please choose a different name.`
        };
      }

      // Check for duplicate addresses
      let addressQuery = supabase
        .from('venues')
        .select('id, name, address_line1')
        .ilike('address_line1', editFormData.addressLine1?.trim() || '');

      if (excludeId) {
        addressQuery = addressQuery.neq('id', excludeId);
      }

      const { data: addressDuplicates, error: addressError } = await addressQuery;

      if (addressError) throw addressError;

      if (addressDuplicates && addressDuplicates.length > 0) {
        return {
          hasDuplicates: true,
          message: `A venue with the address "${editFormData.addressLine1}" already exists (${addressDuplicates[0].name}). Please verify the address.`
        };
      }

      return { hasDuplicates: false, message: '' };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return { hasDuplicates: false, message: '' };
    }
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      // Basic validation
      const errors: { [key: string]: string } = {};
      
      if (!editFormData.name.trim()) {
        errors.name = 'Venue name is required';
      } else if (editFormData.name.trim().length < 3) {
        errors.name = 'Venue name must be at least 3 characters';
      }

      if (!editFormData.location?.trim()) {
        errors.location = 'Location is required';
      }

      if (!editFormData.contactPerson?.trim()) {
        errors.contactPerson = 'Contact person is required';
      }

      if (editFormData.memberCount <= 0) {
        errors.memberCount = 'Capacity must be greater than 0';
      }

      if (Object.keys(errors).length > 0) {
        alert('Please fix the following errors:\n' + Object.values(errors).join('\n'));
        return;
      }

      // Check for duplicates
      const duplicateCheck = await checkForDuplicates(editFormData.id);
      if (duplicateCheck.hasDuplicates) {
        alert(duplicateCheck.message);
        return;
      }

      const { error } = await supabase
        .from('venues')
        .update({
          name: editFormData.name,
          location: editFormData.location,
          contact_person: editFormData.contactPerson,
          email: editFormData.email,
          phone: editFormData.phone,
          capacity: editFormData.memberCount,
          facilities: editFormData.facilities,
          amenities: editFormData.amenities,
          status: editFormData.status,
        })
        .eq('id', editFormData.id);

      if (!error) {
        setShowEditModal(false);
        setEditFormData(null);
        setSelectedVenue(null);
        refetch(); // reload venues from Supabase
      } else {
        alert('Failed to update venue: ' + error.message);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedVenue) {
      const { error, data } = await supabase
        .from('venues')
        .delete()
        .eq('id', selectedVenue.id);

      console.log('Delete response:', { error, data, id: selectedVenue.id });

      if (!error) {
        setShowDeleteModal(false);
        setSelectedVenue(null);
        refetch(); // reload venues from Supabase
        if (Array.isArray(data) && (data as any[]).length === 0) {
          alert('No venue was deleted. This may be due to row-level security or a missing ID.');
        }
      } else {
        alert('Failed to delete venue: ' + error.message);
      }
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedVenue(null);
    setEditFormData(null);
  };

  // Custom Contact Management Functions
  const addCustomContact = () => {
    if (!editFormData) return;
    
    const newContact = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      role: ''
    };
    
    setEditFormData(prev => ({
      ...prev!,
      customContacts: [...(prev?.customContacts || []), newContact]
    }));
  };

  const updateCustomContact = (id: string, field: string, value: string) => {
    if (!editFormData) return;
    
    setEditFormData(prev => ({
      ...prev!,
      customContacts: (prev?.customContacts || []).map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeCustomContact = (id: string) => {
    if (!editFormData) return;
    
    setEditFormData(prev => ({
      ...prev!,
      customContacts: (prev?.customContacts || []).filter(contact => contact.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Venue Management</h1>
          <p className="text-gray-600">Manage venue partnerships and accounts</p>
        </div>
        <Link to="/venues/add">
          <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4" />
            <span>Add Venue</span>
          </Button>
        </Link>
      </div>

      {/* Venue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Venues</p>
                <p className="text-2xl font-bold text-gray-900">{venues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {venues.reduce((sum, v) => sum + v.activeEvents, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {venues.reduce((sum, v) => sum + v.memberCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(venues.reduce((sum, v) => sum + v.totalRevenue, 0) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Search venues by name, location, or contact person..."
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'pending', 'inactive'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors duration-200 ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All Venues' : status}
            <span className="ml-1 sm:ml-2 text-xs">
              {status === 'all' ? venues.length : venues.filter(v => v.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue) => (
            <Card key={venue.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{venue.name}</h3>
                  <Badge variant={getStatusVariant(venue.status)}>
                    {venue.status}
                  </Badge>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{venue.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{venue.memberCount.toLocaleString()} capacity</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{venue.activeEvents} Upcoming events</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Facilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {venue.facilities.slice(0, 3).map((facility, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {venue.facilities.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{venue.facilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">₹{venue.totalRevenue.toLocaleString()}</span>
                    <span className="text-gray-500 ml-1 hidden sm:inline">revenue</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleView(venue)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(venue)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(venue)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {loading ? 'Loading venues...' : 'No venues found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {loading 
                    ? 'Please wait while we load your venues...'
                    : searchTerm 
                      ? `No venues match your search for "${searchTerm}"`
                      : filter !== 'all'
                        ? `No venues with status "${filter}" found`
                        : 'No venues have been added yet.'
                  }
                </p>
                {!loading && (
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Link to="/venues/add">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Venue
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Venues Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Venues Overview ({filteredVenues.length})
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
                <TableHead>Venue</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead className="hidden md:table-cell">Capacity</TableHead>
                <TableHead className="hidden lg:table-cell">Active Events</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 line-clamp-1">{venue.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{venue.location}</span>
                      </div>
                      <div className="text-sm text-gray-500 md:hidden">
                        {venue.memberCount.toLocaleString()} capacity
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{venue.contactPerson}</div>
                      <div className="text-sm text-gray-500 truncate">{venue.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-medium">{venue.memberCount.toLocaleString()}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      {venue.activeEvents}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{venue.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(venue.status)}>
                      {venue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleView(venue)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(venue)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(venue)}>
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

      {/* View Venue Modal */}
      {showViewModal && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedVenue.name}</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{selectedVenue.location}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Person</h4>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{selectedVenue.contactPerson}</div>
                    <div className="text-sm text-gray-600">{selectedVenue.email}</div>
                    <div className="text-sm text-gray-600">{selectedVenue.phone}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Capacity</h4>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{selectedVenue.memberCount.toLocaleString()} people</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Active Events</h4>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{selectedVenue.activeEvents} events</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Total Revenue</h4>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{selectedVenue.totalRevenue.toLocaleString()}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                  <Badge variant={getStatusVariant(selectedVenue.status)} className="text-sm">
                    {selectedVenue.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVenue.facilities.map((facility, index) => (
                    <Badge key={index} variant="default" className="text-sm">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVenue.amenities.map((amenity, index) => (
                    <Badge key={index} variant="default" className="text-sm">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Joined Date</h4>
                <div className="text-sm text-gray-600">
                  {new Date(selectedVenue.joinedDate || '').toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={closeModals}>Close</Button>
              <Button onClick={() => { closeModals(); handleEdit(selectedVenue); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Venue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Venue Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Venue</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editFormData.location || ''}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={editFormData.contactPerson || ''}
                    onChange={(e) => setEditFormData({...editFormData, contactPerson: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={editFormData.memberCount}
                    onChange={(e) => setEditFormData({...editFormData, memberCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Active Events</label>
                  <input
                    type="number"
                    value={editFormData.activeEvents}
                    onChange={(e) => setEditFormData({...editFormData, activeEvents: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Revenue</label>
                <input
                  type="number"
                  value={editFormData.totalRevenue}
                  onChange={(e) => setEditFormData({...editFormData, totalRevenue: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facilities (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.facilities.join(', ')}
                  onChange={(e) => setEditFormData({...editFormData, facilities: e.target.value.split(', ').map(f => f.trim())})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auditorium, Community Hall, Garden Area"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.amenities.join(', ')}
                  onChange={(e) => setEditFormData({...editFormData, amenities: e.target.value.split(', ').map(f => f.trim())})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Wi-Fi, Power Outlets, Lighting"
                />
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
      {showDeleteModal && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Venue</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "<strong>{selectedVenue.name}</strong>"? 
                This will permanently remove the venue and all associated data.
              </p>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={closeModals}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirmDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Venue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};