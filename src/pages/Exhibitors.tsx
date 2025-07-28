import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Users,
  DollarSign,
  FileText,
  Send,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { mockExhibitors } from '../data/mockData';
import { Exhibitor } from '../types';
import { useExhibitors } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';

interface ExhibitorFilters {
  status: string;
  paymentStatus: string;
  category: string;
  city: string;
  search: string;
}

interface EmailFormData {
  subject: string;
  message: string;
  sendCopy: boolean;
}

export const Exhibitors: React.FC = () => {
  const { exhibitors, loading, error, refetch } = useExhibitors();
  const [selectedExhibitors, setSelectedExhibitors] = useState<string[]>([]);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Exhibitor | null>(null);
  const [emailFormData, setEmailFormData] = useState<EmailFormData>({
    subject: '',
    message: '',
    sendCopy: false
  });
  const [filters, setFilters] = useState<ExhibitorFilters>({
    status: 'all',
    paymentStatus: 'all',
    category: 'all',
    city: 'all',
    search: ''
  });

  const filteredExhibitors = exhibitors.filter(exhibitor => {
    const matchesStatus = filters.status === 'all' || exhibitor.status === filters.status;
    const matchesPayment = filters.paymentStatus === 'all' || exhibitor.paymentStatus === filters.paymentStatus;
    const matchesCategory = filters.category === 'all' || exhibitor.category === filters.category;
    const matchesCity = filters.city === 'all' || exhibitor.city === filters.city;
    const matchesSearch = filters.search === '' || 
      exhibitor.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
      exhibitor.contactPerson?.toLowerCase().includes(filters.search.toLowerCase()) ||
      exhibitor.email?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesPayment && matchesCategory && matchesCity && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'registered': return 'info';
      case 'checked_in': return 'success';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'registered': return <Clock className="h-4 w-4" />;
      case 'checked_in': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const stats = {
    total: exhibitors.length,
    confirmed: exhibitors.filter(e => e.status === 'confirmed').length,
    registered: exhibitors.filter(e => e.status === 'registered').length,
    checkedIn: exhibitors.filter(e => e.status === 'checked_in').length,
    cancelled: exhibitors.filter(e => e.status === 'cancelled').length,
    paidAmount: exhibitors.filter(e => e.paymentStatus === 'paid').length * 15000,
    pendingAmount: exhibitors.filter(e => e.paymentStatus === 'pending').length * 15000
  };

  const categories = [...new Set(exhibitors.map(e => e.category))];
  const cities = [...new Set(exhibitors.map(e => e.city))];

  const handleSelectExhibitor = (id: string) => {
    setSelectedExhibitors(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedExhibitors.length === filteredExhibitors.length) {
      setSelectedExhibitors([]);
    } else {
      setSelectedExhibitors(filteredExhibitors.map(e => e.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for exhibitors:`, selectedExhibitors);
    // Implement bulk actions here
    setSelectedExhibitors([]);
  };

  const handleView = (exhibitor: Exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setShowViewModal(true);
  };

  const handleEdit = (exhibitor: Exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setEditFormData({ ...exhibitor });
    setShowEditModal(true);
  };

  const handleEmail = (exhibitor: Exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setEmailFormData({
      subject: `Regarding your exhibition at our upcoming event`,
      message: `Dear ${exhibitor.contactPerson},\n\nWe hope this email finds you well. We are writing to you regarding your participation in our upcoming exhibition event.\n\nBest regards,\nEvent Management Team`,
      sendCopy: false
    });
    setShowEmailModal(true);
  };

  const handleDelete = (exhibitor: Exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      const { error } = await supabase
        .from('exhibitors')
        .update({
          company_name: editFormData.companyName,
          contact_person: editFormData.contactPerson,
          email: editFormData.email,
          phone: editFormData.phone,
          category: editFormData.category,
          city: editFormData.city,
          booth: editFormData.booth,
          payment_status: editFormData.paymentStatus,
          status: editFormData.status,
        })
        .eq('id', editFormData.id);

      if (error) {
        alert('Failed to update exhibitor: ' + error.message);
      } else {
        setShowEditModal(false);
        setEditFormData(null);
        setSelectedExhibitor(null);
        refetch();
      }
    }
  };

  const handleSendEmail = () => {
    if (selectedExhibitor) {
      // Simulate sending email
      console.log('Sending email to:', selectedExhibitor.email, emailFormData);
      // Here you would integrate with your email service
      setShowEmailModal(false);
      setSelectedExhibitor(null);
      setEmailFormData({ subject: '', message: '', sendCopy: false });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedExhibitor) {
      const { error } = await supabase
        .from('exhibitors')
        .delete()
        .eq('id', selectedExhibitor.id);

      if (error) {
        alert('Failed to delete exhibitor: ' + error.message);
      } else {
        setShowDeleteModal(false);
        setSelectedExhibitor(null);
        refetch();
      }
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowEmailModal(false);
    setShowDeleteModal(false);
    setSelectedExhibitor(null);
    setEditFormData(null);
    setEmailFormData({ subject: '', message: '', sendCopy: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exhibitor Management</h1>
          <p className="text-gray-600">Manage exhibitor registrations, booth assignments, and payments</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Link to="/exhibitors/add">
            <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
              <Plus className="h-4 w-4" />
              <span>Add Exhibitor</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Exhibitors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-xs sm:text-sm text-gray-600">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.registered}</div>
            <div className="text-xs sm:text-sm text-gray-600">Registered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.checkedIn}</div>
            <div className="text-xs sm:text-sm text-gray-600">Checked In</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs sm:text-sm text-gray-600">Cancelled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">₹{(stats.paidAmount / 100000).toFixed(1)}L</div>
            <div className="text-xs sm:text-sm text-gray-600">Paid Amount</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">₹{(stats.pendingAmount / 100000).toFixed(1)}L</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending Amount</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exhibitors..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category || ''} value={category || ''}>{category || ''}</option>
              ))}
            </select>
            <select
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city || ''} value={city || ''}>{city || ''}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedExhibitors.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedExhibitors.length} exhibitor(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('confirm')}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                  <Mail className="h-4 w-4 mr-1" />
                  Send Email
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedExhibitors([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exhibitors Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Exhibitors Overview ({filteredExhibitors.length})
            </h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Advanced Filters</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedExhibitors.length === filteredExhibitors.length && filteredExhibitors.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Booth</TableHead>
                <TableHead className="hidden xl:table-cell">Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading exhibitors...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-red-500">
                    Error loading exhibitors: {error}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExhibitors.map(exhibitor => (
                  <TableRow key={exhibitor.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedExhibitors.includes(exhibitor.id)}
                        onChange={() => handleSelectExhibitor(exhibitor.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{exhibitor.companyName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{exhibitor.city}</span>
                        </div>
                        <div className="text-sm text-gray-500 md:hidden">
                          {exhibitor.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exhibitor.contactPerson || 'N/A'}</div>
                        <div className="text-sm text-gray-500 flex items-center truncate">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{exhibitor.email || 'N/A'}</span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{exhibitor.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="default">{exhibitor.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">{exhibitor.booth}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(exhibitor.registrationDate || '').toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(exhibitor.status)}
                        <Badge variant={getStatusVariant(exhibitor.status)} className="ml-2">
                          <span className="hidden sm:inline">{exhibitor.status.replace('_', ' ')}</span>
                          <span className="sm:hidden">{exhibitor.status.split('_')[0]}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        <Badge variant={getPaymentStatusVariant(exhibitor.paymentStatus)}>
                          {exhibitor.paymentStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleView(exhibitor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit(exhibitor)}
                          className="hidden sm:inline-flex"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEmail(exhibitor)}
                          className="hidden sm:inline-flex"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(exhibitor)}
                          className="hidden lg:inline-flex"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Exhibitor Modal */}
      {showViewModal && selectedExhibitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Exhibitor Details</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Company Name</label>
                      <p className="text-gray-900">{selectedExhibitor.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <p className="text-gray-900">{selectedExhibitor.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <p className="text-gray-900">{selectedExhibitor.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booth Number</label>
                      <p className="text-gray-900 font-medium">{selectedExhibitor.booth}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Contact Person</label>
                      <p className="text-gray-900">{selectedExhibitor.contactPerson || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedExhibitor.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedExhibitor.phone || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status and Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Registration Status</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Status</label>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedExhibitor.status)}
                        <Badge variant={getStatusVariant(selectedExhibitor.status)} className="ml-2">
                          {selectedExhibitor.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Registration Date</label>
                      <p className="text-gray-900">{new Date(selectedExhibitor.registrationDate || '').toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Payment Status</label>
                      <div className="flex items-center mt-1">
                        <CreditCard className="h-4 w-4 mr-1" />
                        <Badge variant={getPaymentStatusVariant(selectedExhibitor.paymentStatus)}>
                          {selectedExhibitor.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-gray-900 font-medium">₹15,000</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => { closeModals(); handleEmail(selectedExhibitor); }}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button onClick={() => { closeModals(); handleEdit(selectedExhibitor); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exhibitor Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Exhibitor</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={editFormData.companyName || ''}
                  onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={editFormData.category || ''}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booth Number</label>
                  <input
                    type="text"
                    value={editFormData.booth || ''}
                    onChange={(e) => setEditFormData({...editFormData, booth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="registered">Registered</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={editFormData.paymentStatus}
                    onChange={(e) => setEditFormData({...editFormData, paymentStatus: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
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

      {/* Email Exhibitor Modal */}
      {showEmailModal && selectedExhibitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Recipient</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>{selectedExhibitor.contactPerson || 'N/A'}</strong></div>
                  <div>{selectedExhibitor.companyName || 'N/A'}</div>
                  <div>{selectedExhibitor.email || 'N/A'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailFormData.subject}
                  onChange={(e) => setEmailFormData({...emailFormData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={emailFormData.message}
                  onChange={(e) => setEmailFormData({...emailFormData, message: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendCopy"
                  checked={emailFormData.sendCopy}
                  onChange={(e) => setEmailFormData({...emailFormData, sendCopy: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendCopy" className="ml-2 block text-sm text-gray-700">
                  Send a copy to myself
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={closeModals}>Cancel</Button>
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedExhibitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Exhibitor</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "<strong>{selectedExhibitor.companyName || 'N/A'}</strong>"? This
                will permanently remove the exhibitor and all associated data.
              </p>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={closeModals}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirmDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Exhibitor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};