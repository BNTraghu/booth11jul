import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar as CalendarIcon, Users, Filter, Search, X, Save, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { mockEvents } from '../data/mockData';
import { Event } from '../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState(mockEvents);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Event | null>(null);

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    setEditFormData({ ...event });
    setShowEditModal(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      setEvents(prev => prev.map(event => 
        event.id === editFormData.id ? editFormData : event
      ));
      setShowEditModal(false);
      setEditFormData(null);
      setSelectedEvent(null);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setShowDeleteModal(false);
      setSelectedEvent(null);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedEvent(null);
    setEditFormData(null);
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
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                  <input
                    type="text"
                    value={editFormData.venue}
                    onChange={(e) => setEditFormData({...editFormData, venue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                  <input
                    type="number"
                    value={editFormData.maxCapacity}
                    onChange={(e) => setEditFormData({...editFormData, maxCapacity: parseInt(e.target.value)})}
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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