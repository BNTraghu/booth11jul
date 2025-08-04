import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  Upload,
  Image,
  Globe,
  Tag,
  Truck,
  Shield,
  User,
  Package,
  ArrowLeft
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
  subCategory: string;
  city: string;
  search: string;
}

interface EmailFormData {
  subject: string;
  message: string;
  sendCopy: boolean;
}

interface ExtendedExhibitorFormData {
  id: string;
  // Company Information
  companyName: string;
  companyDescription: string;
  establishedYear: string;
  companySize: string;
  website: string;
  
  // Contact Information
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone: string;
  alternateEmail: string;
  
  // Business Details
  category: string;
  subCategory: string;
  businessType: string;
  gstNumber: string;
  panNumber: string;
  
  // Location & Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  
  // Exhibition Details
  boothPreference: string;
  boothSize: string;
  specialRequirements: string;
  previousExhibitions: string;
  expectedVisitors: string;
  
  // Products & Services
  products: string[];
  services: string[];
  targetAudience: string;
  
  // Payment & Billing
  registrationFee: number;
  paymentMethod: string;
  billingAddress: string;
  
  // Additional Information
  socialMediaLinks: {
    linkedin: string;
    facebook: string;
    twitter: string;
    instagram: string;
  };
  
  // Settings
  status: 'registered' | 'confirmed' | 'checked_in' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  sendConfirmationEmail: boolean;
  allowMarketingEmails: boolean;
}

export const Exhibitors: React.FC = () => {
  const { exhibitors, loading, error, refetch } = useExhibitors();
  const [selectedExhibitors, setSelectedExhibitors] = useState<string[]>([]);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<ExtendedExhibitorFormData | null>(null);
  const [editStep, setEditStep] = useState(1);
  const [editErrors, setEditErrors] = useState<{[key: string]: string}>({});
  const [emailFormData, setEmailFormData] = useState<EmailFormData>({
    subject: '',
    message: '',
    sendCopy: false
  });
  const [newProduct, setNewProduct] = useState('');
  const [newService, setNewService] = useState('');
  const [filters, setFilters] = useState<ExhibitorFilters>({
    status: 'all',
    paymentStatus: 'all',
    category: 'all',
    subCategory: 'all',
    city: 'all',
    search: ''
  });

  const filteredExhibitors = exhibitors.filter(exhibitor => {
    const matchesStatus = filters.status === 'all' || exhibitor.status === filters.status;
    const matchesPayment = filters.paymentStatus === 'all' || exhibitor.paymentStatus === filters.paymentStatus;
    const matchesCategory = filters.category === 'all' || exhibitor.category === filters.category;
    const matchesSubCategory = filters.subCategory === 'all' || exhibitor.subCategory === filters.subCategory;
    const matchesCity = filters.city === 'all' || exhibitor.city === filters.city;
    const matchesSearch = filters.search === '' || 
      exhibitor.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
      exhibitor.contactPerson?.toLowerCase().includes(filters.search.toLowerCase()) ||
      exhibitor.email?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesPayment && matchesCategory && matchesSubCategory && matchesCity && matchesSearch;
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

  // Constants for dropdowns (from AddExhibitor)
  const subCategories = {
    'Technology': ['Software', 'Hardware', 'AI/ML', 'Cloud Computing', 'Cybersecurity', 'IoT'],
    'Healthcare': ['Medical Devices', 'Pharmaceuticals', 'Telemedicine', 'Wellness', 'Diagnostics'],
    'Manufacturing': ['Automotive', 'Electronics', 'Textiles', 'Chemicals', 'Machinery'],
    'Retail': ['E-commerce', 'Fashion', 'Electronics', 'Home & Garden', 'Sports'],
    'Finance': ['Banking', 'Insurance', 'Investment', 'Fintech', 'Accounting'],
    'Education': ['EdTech', 'Online Learning', 'Training', 'Certification', 'Academic Services'],
    'Fashion': ['Clothing', 'Accessories', 'Footwear', 'Jewelry', 'Beauty Products'],
    'Food & Beverage': ['Restaurants', 'Catering', 'Packaged Foods', 'Beverages', 'Organic Products'],
    'Automotive': ['Cars', 'Motorcycles', 'Parts & Accessories', 'Services', 'Electric Vehicles'],
    'Sports & Fitness': ['Equipment', 'Apparel', 'Fitness Centers', 'Sports Services', 'Nutrition'],
    'Real Estate': ['Residential', 'Commercial', 'Property Management', 'Construction', 'Architecture'],
    'Services': ['Consulting', 'Marketing', 'Legal', 'Accounting', 'IT Services']
  };

  const businessTypes = ['Private Limited', 'Public Limited', 'Partnership', 'Sole Proprietorship', 'LLP', 'NGO', 'Government'];
  const boothSizes = ['3x3 meters', '3x6 meters', '6x6 meters', '6x9 meters', '9x9 meters', 'Custom Size'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Uttar Pradesh', 'Madhya Pradesh', 'Haryana'];

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
    // Map Exhibitor to ExtendedExhibitorFormData with existing values
    setEditFormData({
      id: exhibitor.id,
      // Company Information
      companyName: exhibitor.companyName || '',
      companyDescription: exhibitor.companyDescription || '',
      establishedYear: exhibitor.establishedYear || '',
      companySize: exhibitor.companySize || '',
      website: exhibitor.website || '',
      
      // Contact Information
      contactPerson: exhibitor.contactPerson || '',
      designation: exhibitor.designation || '',
      email: exhibitor.email || '',
      phone: exhibitor.phone || '',
      alternatePhone: exhibitor.alternatePhone || '',
      alternateEmail: exhibitor.alternateEmail || '',
      
      // Business Details
      category: exhibitor.category || '',
      subCategory: exhibitor.subCategory || '',
      businessType: exhibitor.businessType || '',
      gstNumber: exhibitor.gstNumber || '',
      panNumber: exhibitor.panNumber || '',
      
      // Location & Address
      address: exhibitor.address || '',
      city: exhibitor.city || '',
      state: exhibitor.state || '',
      pincode: exhibitor.pincode || '',
      country: exhibitor.country || 'India',
      
      // Exhibition Details
      boothPreference: exhibitor.boothPreference || '',
      boothSize: exhibitor.boothSize || '',
      specialRequirements: exhibitor.specialRequirements || '',
      previousExhibitions: exhibitor.previousExhibitions || '',
      expectedVisitors: exhibitor.expectedVisitors || '',
      
      // Products & Services
      products: exhibitor.products || [],
      services: exhibitor.services || [],
      targetAudience: exhibitor.targetAudience || '',
      
      // Payment & Billing
      registrationFee: exhibitor.registrationFee || 15000,
      paymentMethod: exhibitor.paymentMethod || 'online',
      billingAddress: exhibitor.billingAddress || '',
      
      // Additional Information
      socialMediaLinks: {
        linkedin: exhibitor.socialMediaLinks?.linkedin || '',
        facebook: exhibitor.socialMediaLinks?.facebook || '',
        twitter: exhibitor.socialMediaLinks?.twitter || '',
        instagram: exhibitor.socialMediaLinks?.instagram || ''
      },
      
      // Settings
      status: exhibitor.status || 'registered',
      paymentStatus: exhibitor.paymentStatus || 'pending',
      sendConfirmationEmail: exhibitor.sendConfirmationEmail === true,
      allowMarketingEmails: exhibitor.allowMarketingEmails === true
    });
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
      console.log('Starting exhibitor update with data:', editFormData);
      
      const updateData = {
        // Company Information
        company_name: editFormData.companyName,
        company_description: editFormData.companyDescription,
        established_year: editFormData.establishedYear,
        company_size: editFormData.companySize,
        website: editFormData.website,
        
        // Contact Information
        contact_person: editFormData.contactPerson,
        designation: editFormData.designation,
        email: editFormData.email,
        phone: editFormData.phone,
        alternate_email: editFormData.alternateEmail,
        alternate_phone: editFormData.alternatePhone,
        
        // Business Details
        category: editFormData.category,
        sub_category: editFormData.subCategory,
        business_type: editFormData.businessType,
        gst_number: editFormData.gstNumber,
        pan_number: editFormData.panNumber,
        
        // Location & Address
        address: editFormData.address,
        city: editFormData.city,
        state: editFormData.state,
        pincode: editFormData.pincode,
        country: editFormData.country,
        
        // Exhibition Details
        booth_preference: editFormData.boothPreference,
        booth_size: editFormData.boothSize,
        special_requirements: editFormData.specialRequirements,
        previous_exhibitions: editFormData.previousExhibitions,
        expected_visitors: editFormData.expectedVisitors,
        
        // Products & Services
        products: editFormData.products,
        services: editFormData.services,
        target_audience: editFormData.targetAudience,
        
        // Payment & Billing
        registration_fee: editFormData.registrationFee,
        payment_method: editFormData.paymentMethod,
        billing_address: editFormData.billingAddress,
        
        // Additional Information
        social_media_links: editFormData.socialMediaLinks,
        
        // Settings
        status: editFormData.status,
        payment_status: editFormData.paymentStatus,
        send_confirmation_email: editFormData.sendConfirmationEmail,
        allow_marketing_emails: editFormData.allowMarketingEmails
      };
      
      console.log('Update data being sent:', updateData);
      console.log('Updating exhibitor ID:', editFormData.id);

      try {
        const { data, error } = await supabase
          .from('exhibitors')
          .update(updateData)
          .eq('id', editFormData.id)
          .select();

        if (error) {
          console.error('Supabase update error:', error);
          showNotification('Failed to update exhibitor: ' + error.message, 'error');
        } else {
          console.log('Update successful - returned data:', data);
          console.log('Number of rows updated:', data?.length || 0);
          console.log('Updated exhibitor data:', data?.[0]);
          
          showNotification('Exhibitor updated successfully!', 'success');
          setShowEditModal(false);
          setEditFormData(null);
          setSelectedExhibitor(null);
          
          // Force a refetch with a small delay to ensure database has updated
          setTimeout(() => {
            console.log('Refetching exhibitor data...');
            refetch();
          }, 500);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        showNotification('Unexpected error occurred: ' + err, 'error');
      }
    } else {
      console.error('No editFormData available');
      showNotification('No data to update', 'error');
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

  const handleSendEmail = () => {
    // Simulate email sending
    showNotification('Email sent successfully!', 'success');
    setShowEmailModal(false);
    setSelectedExhibitor(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedExhibitor) {
      const { error } = await supabase
        .from('exhibitors')
        .delete()
        .eq('id', selectedExhibitor.id);

      if (error) {
        showNotification('Failed to delete exhibitor: ' + error.message, 'error');
      } else {
        showNotification('Exhibitor deleted successfully!', 'success');
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
    setEditStep(1);
    setEditErrors({});
    setEmailFormData({ subject: '', message: '', sendCopy: false });
    setNewProduct('');
    setNewService('');
  };

  const addProduct = () => {
    if (newProduct.trim() && editFormData && !editFormData.products.includes(newProduct.trim())) {
      setEditFormData(prev => prev ? {
        ...prev,
        products: [...prev.products, newProduct.trim()]
      } : null);
      setNewProduct('');
    }
  };

  const removeProduct = (index: number) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        products: editFormData.products.filter((_, i) => i !== index)
      });
    }
  };

  const addService = () => {
    if (newService.trim() && editFormData && !editFormData.services.includes(newService.trim())) {
      setEditFormData(prev => prev ? {
        ...prev,
        services: [...prev.services, newService.trim()]
      } : null);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        services: editFormData.services.filter((_, i) => i !== index)
      });
    }
  };

  const nextEditStep = () => {
    setEditStep(prev => Math.min(prev + 1, 5));
  };

  const prevEditStep = () => {
    setEditStep(prev => Math.max(prev - 1, 1));
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
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
              value={filters.subCategory}
              onChange={(e) => setFilters(prev => ({ ...prev, subCategory: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sub Categories</option>
              {[...new Set(exhibitors
                .filter(e => filters.category === 'all' || e.category === filters.category)
                .map(e => e.subCategory)
                .filter(Boolean))].map(subCategory => (
                <option key={subCategory || ''} value={subCategory || ''}>{subCategory || ''}</option>
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
                    <TableHead className="hidden lg:table-cell">Sub Category</TableHead>
                    <TableHead className="hidden xl:table-cell">Booth</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Registration Date</TableHead>
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
                      <Badge variant="default">{exhibitor.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="info">{exhibitor.subCategory || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">{exhibitor.booth || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                        {exhibitor.registrationDate ? new Date(exhibitor.registrationDate).toLocaleDateString() : 'N/A'}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                      <p className="text-gray-900">{selectedExhibitor.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sub Category</label>
                      <p className="text-gray-900">{selectedExhibitor.subCategory || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Business Type</label>
                      <p className="text-gray-900">{selectedExhibitor.businessType || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Established Year</label>
                      <p className="text-gray-900">{selectedExhibitor.establishedYear || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Company Size</label>
                      <p className="text-gray-900">{selectedExhibitor.companySize || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      <p className="text-gray-900">
                        {selectedExhibitor.website ? (
                          <a href={selectedExhibitor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedExhibitor.website}
                          </a>
                        ) : 'N/A'}
                      </p>
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
                      <label className="text-sm font-medium text-gray-700">Designation</label>
                      <p className="text-gray-900">{selectedExhibitor.designation || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedExhibitor.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedExhibitor.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Alternate Phone</label>
                      <p className="text-gray-900">{selectedExhibitor.alternatePhone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Alternate Email</label>
                      <p className="text-gray-900">{selectedExhibitor.alternateEmail || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Location & Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Location & Address</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900">{selectedExhibitor.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <p className="text-gray-900">{selectedExhibitor.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">State</label>
                      <p className="text-gray-900">{selectedExhibitor.state || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Pincode</label>
                      <p className="text-gray-900">{selectedExhibitor.pincode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <p className="text-gray-900">{selectedExhibitor.country || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">GST Number</label>
                      <p className="text-gray-900">{selectedExhibitor.gstNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">PAN Number</label>
                      <p className="text-gray-900">{selectedExhibitor.panNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booth Preference</label>
                      <p className="text-gray-900">{selectedExhibitor.boothPreference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booth Size</label>
                      <p className="text-gray-900">{selectedExhibitor.boothSize || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Target Audience</label>
                      <p className="text-gray-900">{selectedExhibitor.targetAudience || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Products & Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                  </CardHeader>
                  <CardContent>
                    {selectedExhibitor.products && selectedExhibitor.products.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedExhibitor.products.map((product, index) => (
                          <Badge key={index} variant="default">{product}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No products listed</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                  </CardHeader>
                  <CardContent>
                    {selectedExhibitor.services && selectedExhibitor.services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedExhibitor.services.map((service, index) => (
                          <Badge key={index} variant="info">{service}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No services listed</p>
                    )}
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
                      <p className="text-gray-900">{selectedExhibitor.registrationDate ? new Date(selectedExhibitor.registrationDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created Date</label>
                      <p className="text-gray-900">{new Date(selectedExhibitor.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="text-gray-900">{new Date(selectedExhibitor.updated_at).toLocaleDateString()}</p>
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
                      <label className="text-sm font-medium text-gray-700">Registration Fee</label>
                      <p className="text-gray-900 font-medium">₹{selectedExhibitor.registrationFee?.toLocaleString() || '15,000'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Payment Method</label>
                      <p className="text-gray-900">{selectedExhibitor.paymentMethod || 'N/A'}</p>
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Exhibitor - {editFormData.companyName}</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Step Indicator */}
              <div className="mt-4">
                <div className="flex items-center justify-center space-x-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        editStep >= step 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {step < 5 && (
                        <div className={`w-12 h-1 mx-2 ${
                          editStep > step ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-center mt-2 text-sm text-gray-600">
                  {editStep === 1 && 'Company Information'}
                  {editStep === 2 && 'Contact & Business Details'}
                  {editStep === 3 && 'Location & Exhibition'}
                  {editStep === 4 && 'Products & Services'}
                  {editStep === 5 && 'Settings & Save'}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Step 1: Company Information */}
              {editStep === 1 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                        <input
                          type="text"
                          value={editFormData.companyName || ''}
                          onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                        <textarea
                          value={editFormData.companyDescription || ''}
                          onChange={(e) => setEditFormData({...editFormData, companyDescription: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe your company"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
                          <input
                            type="text"
                            value={editFormData.establishedYear || ''}
                            onChange={(e) => setEditFormData({...editFormData, establishedYear: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 2010"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                          <select
                            value={editFormData.companySize || ''}
                            onChange={(e) => setEditFormData({...editFormData, companySize: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select company size</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-500">201-500 employees</option>
                            <option value="500+">500+ employees</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={editFormData.website || ''}
                          onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.example.com"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 2: Contact & Business Details */}
              {editStep === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                          <input
                            type="text"
                            value={editFormData.contactPerson || ''}
                            onChange={(e) => setEditFormData({...editFormData, contactPerson: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter contact person name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                          <input
                            type="text"
                            value={editFormData.designation || ''}
                            onChange={(e) => setEditFormData({...editFormData, designation: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Manager, Director"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="contact@company.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                          <input
                            type="tel"
                            value={editFormData.phone || ''}
                            onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                          <input
                            type="tel"
                            value={editFormData.alternatePhone || ''}
                            onChange={(e) => setEditFormData({...editFormData, alternatePhone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Alternate phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Email</label>
                          <input
                            type="email"
                            value={editFormData.alternateEmail || ''}
                            onChange={(e) => setEditFormData({...editFormData, alternateEmail: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Alternate email address"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                          <select
                            value={editFormData.category || ''}
                            onChange={(e) => {
                              setEditFormData({...editFormData, category: e.target.value, subCategory: ''});
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select category</option>
                            {Object.keys(subCategories).map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                          <select
                            value={editFormData.subCategory || ''}
                            onChange={(e) => setEditFormData({...editFormData, subCategory: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!editFormData.category}
                          >
                            <option value="">Select sub-category</option>
                            {editFormData.category && subCategories[editFormData.category as keyof typeof subCategories]?.map((subCat) => (
                              <option key={subCat} value={subCat}>{subCat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                          <select
                            value={editFormData.businessType || ''}
                            onChange={(e) => setEditFormData({...editFormData, businessType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select business type</option>
                            {businessTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                          <input
                            type="text"
                            value={editFormData.gstNumber || ''}
                            onChange={(e) => setEditFormData({...editFormData, gstNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="GST number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                        <input
                          type="text"
                          value={editFormData.panNumber || ''}
                          onChange={(e) => setEditFormData({...editFormData, panNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="PAN number"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Location & Exhibition */}
              {editStep === 3 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Location & Address</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                        <textarea
                          value={editFormData.address || ''}
                          onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter complete address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                          <input
                            type="text"
                            value={editFormData.city || ''}
                            onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                          <select
                            value={editFormData.state || ''}
                            onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select state</option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                          <input
                            type="text"
                            value={editFormData.pincode || ''}
                            onChange={(e) => setEditFormData({...editFormData, pincode: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter pincode"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <input
                            type="text"
                            value={editFormData.country || 'India'}
                            onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Exhibition Details</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Booth Preference</label>
                          <input
                            type="text"
                            value={editFormData.boothPreference || ''}
                            onChange={(e) => setEditFormData({...editFormData, boothPreference: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Corner booth, Near entrance"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Booth Size</label>
                          <select
                            value={editFormData.boothSize || ''}
                            onChange={(e) => setEditFormData({...editFormData, boothSize: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select booth size</option>
                            {boothSizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                        <textarea
                          value={editFormData.specialRequirements || ''}
                          onChange={(e) => setEditFormData({...editFormData, specialRequirements: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Any special requirements for your booth"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Previous Exhibitions</label>
                          <input
                            type="text"
                            value={editFormData.previousExhibitions || ''}
                            onChange={(e) => setEditFormData({...editFormData, previousExhibitions: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="List previous exhibitions"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Visitors</label>
                          <input
                            type="text"
                            value={editFormData.expectedVisitors || ''}
                            onChange={(e) => setEditFormData({...editFormData, expectedVisitors: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 1000+ visitors"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Products & Services */}
              {editStep === 4 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Products & Services</h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newProduct}
                              onChange={(e) => setNewProduct(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Add a product"
                              onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                            />
                            <Button onClick={addProduct} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editFormData.products.map((product, index) => (
                              <Badge key={index} variant="default" className="flex items-center gap-1">
                                {product}
                                <button
                                  onClick={() => removeProduct(index)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newService}
                              onChange={(e) => setNewService(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Add a service"
                              onKeyPress={(e) => e.key === 'Enter' && addService()}
                            />
                            <Button onClick={addService} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editFormData.services.map((service, index) => (
                              <Badge key={index} variant="info" className="flex items-center gap-1">
                                {service}
                                <button
                                  onClick={() => removeService(index)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                        <input
                          type="text"
                          value={editFormData.targetAudience || ''}
                          onChange={(e) => setEditFormData({...editFormData, targetAudience: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., B2B, Retail customers, etc."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                          <input
                            type="url"
                            value={editFormData.socialMediaLinks?.linkedin || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData, 
                              socialMediaLinks: {...editFormData.socialMediaLinks, linkedin: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="LinkedIn profile URL"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                          <input
                            type="url"
                            value={editFormData.socialMediaLinks?.facebook || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData, 
                              socialMediaLinks: {...editFormData.socialMediaLinks, facebook: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Facebook page URL"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                          <input
                            type="url"
                            value={editFormData.socialMediaLinks?.twitter || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData, 
                              socialMediaLinks: {...editFormData.socialMediaLinks, twitter: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Twitter profile URL"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                          <input
                            type="url"
                            value={editFormData.socialMediaLinks?.instagram || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData, 
                              socialMediaLinks: {...editFormData.socialMediaLinks, instagram: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Instagram profile URL"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 5: Settings & Save */}
              {editStep === 5 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Settings & Status</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee</label>
                          <input
                            type="number"
                            value={editFormData.registrationFee || 15000}
                            onChange={(e) => setEditFormData({...editFormData, registrationFee: Number(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Registration fee"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                          <select
                            value={editFormData.paymentMethod || ''}
                            onChange={(e) => setEditFormData({...editFormData, paymentMethod: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select payment method</option>
                            <option value="online">Online Payment</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="cash">Cash</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                        <textarea
                          value={editFormData.billingAddress || ''}
                          onChange={(e) => setEditFormData({...editFormData, billingAddress: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Billing address (if different from company address)"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <div>
                  {editStep > 1 && (
                    <Button variant="outline" onClick={prevEditStep}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={closeModals}>
                    Cancel
                  </Button>
                  
                  {editStep < 5 ? (
                    <Button onClick={nextEditStep}>
                      Next
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
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