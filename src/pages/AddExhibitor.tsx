import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  FileText,
  Package,
  AlertCircle,
  CheckCircle,
  Info,
  Upload,
  X,
  Plus,
  Eye,
  EyeOff,
  Globe,
  Tag,
  Users,
  Truck,
  Shield
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
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
  
  // Documents
  documents: {
    companyProfile: File | null;
    gstCertificate: File | null;
    panCard: File | null;
    productCatalog: File | null;
  };
  
  // Settings
  status: 'registered' | 'confirmed' | 'pending_approval';
  paymentStatus: 'pending' | 'paid' | 'partial';
  sendConfirmationEmail: boolean;
  allowMarketingEmails: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const exhibitorCategories = [
  'Technology',
  'Healthcare',
  'Education',
  'Fashion',
  'Food & Beverage',
  'Automotive',
  'Home & Garden',
  'Sports & Fitness',
  'Travel & Tourism',
  'Finance & Banking',
  'Real Estate',
  'Entertainment',
  'Manufacturing',
  'Retail',
  'Services',
  'Others'
];

const subCategories = {
  'Technology': ['Software', 'Hardware', 'AI/ML', 'IoT', 'Cybersecurity', 'Mobile Apps', 'Web Development'],
  'Healthcare': ['Medical Devices', 'Pharmaceuticals', 'Telemedicine', 'Health Tech', 'Wellness'],
  'Education': ['EdTech', 'Online Learning', 'Training', 'Certification', 'Academic Services'],
  'Fashion': ['Clothing', 'Accessories', 'Footwear', 'Jewelry', 'Beauty Products'],
  'Food & Beverage': ['Restaurants', 'Catering', 'Packaged Foods', 'Beverages', 'Organic Products'],
  'Automotive': ['Cars', 'Motorcycles', 'Parts & Accessories', 'Services', 'Electric Vehicles'],
  'Home & Garden': ['Furniture', 'Decor', 'Appliances', 'Gardening', 'Home Improvement'],
  'Sports & Fitness': ['Equipment', 'Apparel', 'Fitness Centers', 'Sports Services', 'Nutrition'],
  'Travel & Tourism': ['Hotels', 'Travel Agencies', 'Tour Operators', 'Transportation', 'Destinations'],
  'Finance & Banking': ['Banks', 'Insurance', 'Investment', 'Fintech', 'Loans & Credit'],
  'Real Estate': ['Residential', 'Commercial', 'Property Management', 'Construction', 'Architecture'],
  'Entertainment': ['Events', 'Media', 'Gaming', 'Music', 'Film & Video'],
  'Manufacturing': ['Industrial Equipment', 'Raw Materials', 'Machinery', 'Tools', 'Automation'],
  'Retail': ['E-commerce', 'Physical Stores', 'Wholesale', 'Distribution', 'Franchising'],
  'Services': ['Consulting', 'Marketing', 'Legal', 'Accounting', 'IT Services'],
  'Others': ['Miscellaneous', 'Emerging Industries', 'Non-profit', 'Government', 'Research']
};

const businessTypes = ['Private Limited', 'Public Limited', 'Partnership', 'Sole Proprietorship', 'LLP', 'NGO', 'Government'];
const companySizes = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];
const boothSizes = ['3x3 meters', '3x6 meters', '6x6 meters', '6x9 meters', '9x9 meters', 'Custom Size'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Uttar Pradesh', 'Madhya Pradesh', 'Haryana'];

export const AddExhibitor: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Company Information
    companyName: '',
    companyDescription: '',
    establishedYear: '',
    companySize: '',
    website: '',
    
    // Contact Information
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    alternatePhone: '',
    alternateEmail: '',
    
    // Business Details
    category: '',
    subCategory: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    
    // Location & Address
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    
    // Exhibition Details
    boothPreference: '',
    boothSize: '',
    specialRequirements: '',
    previousExhibitions: '',
    expectedVisitors: '',
    
    // Products & Services
    products: [],
    services: [],
    targetAudience: '',
    
    // Payment & Billing
    registrationFee: 15000,
    paymentMethod: 'online',
    billingAddress: '',
    
    // Additional Information
    socialMediaLinks: {
      linkedin: '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    
    // Documents
    documents: {
      companyProfile: null,
      gstCertificate: null,
      panCard: null,
      productCatalog: null
    },
    
    // Settings
    status: 'registered',
    paymentStatus: 'pending',
    sendConfirmationEmail: true,
    allowMarketingEmails: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [newProduct, setNewProduct] = useState('');
  const [newService, setNewService] = useState('');

  // Only super admins, admins, and sales/marketing can access this page
  if (!hasRole(['super_admin', 'admin', 'sales_marketing'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to add exhibitors.</p>
        </div>
      </div>
    );
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1: // Company Information
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.companyDescription.trim()) newErrors.companyDescription = 'Company description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        break;

      case 2: // Contact Information
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
        break;

      case 3: // Business & Location Details
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        break;

      case 4: // Exhibition Details
        if (!formData.boothSize) newErrors.boothSize = 'Booth size is required';
        if (!formData.expectedVisitors.trim()) newErrors.expectedVisitors = 'Expected visitors is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof FormData],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const addProduct = () => {
    if (newProduct.trim() && !formData.products.includes(newProduct.trim())) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, newProduct.trim()]
      }));
      setNewProduct('');
    }
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Creating exhibitor:', formData);
      
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/exhibitors');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating exhibitor:', error);
      setErrors({ submit: 'Failed to create exhibitor. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Company Info', icon: Building },
    { number: 2, title: 'Contact Details', icon: User },
    { number: 3, title: 'Business & Location', icon: MapPin },
    { number: 4, title: 'Exhibition Details', icon: Package },
    { number: 5, title: 'Review & Submit', icon: CheckCircle }
  ];

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exhibitor Registered Successfully!</h2>
            <p className="text-gray-600 mb-6">
              The exhibitor has been registered and {formData.sendConfirmationEmail ? 'a confirmation email has been sent' : 'can now access their booth details'}.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/exhibitors')} className="w-full">
                Go to Exhibitor Management
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubmitSuccess(false);
                  setCurrentStep(1);
                  // Reset form data
                }}
                className="w-full"
              >
                Add Another Exhibitor
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
            onClick={() => navigate('/exhibitors')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Exhibitors</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Exhibitor</h1>
            <p className="text-gray-600">Register a new exhibitor for upcoming events</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Step {step.number}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-3">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Company Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.companyName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        handleInputChange('category', e.target.value);
                        handleInputChange('subCategory', ''); // Reset subcategory
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {exhibitorCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-Category
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => handleInputChange('subCategory', e.target.value)}
                      disabled={!formData.category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select sub-category</option>
                      {formData.category && subCategories[formData.category as keyof typeof subCategories]?.map((subCat) => (
                        <option key={subCat} value={subCat}>
                          {subCat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.businessType ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.businessType && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.businessType}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description *
                  </label>
                  <textarea
                    value={formData.companyDescription}
                    onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.companyDescription ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe your company, products, and services..."
                  />
                  {errors.companyDescription && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.companyDescription}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select size</option>
                      {companySizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
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
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.designation ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="CEO, Manager, Director, etc."
                    />
                    {errors.designation && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.designation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Email *
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
                        placeholder="contact@company.com"
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
                      Alternate Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.alternateEmail}
                        onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="alternate@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Phone *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.alternatePhone}
                        onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91-9876543211"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Social Media Links (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.socialMediaLinks.linkedin}
                        onChange={(e) => handleInputChange('socialMediaLinks.linkedin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.socialMediaLinks.facebook}
                        onChange={(e) => handleInputChange('socialMediaLinks.facebook', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={formData.socialMediaLinks.twitter}
                        onChange={(e) => handleInputChange('socialMediaLinks.twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://twitter.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={formData.socialMediaLinks.instagram}
                        onChange={(e) => handleInputChange('socialMediaLinks.instagram', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Business & Location Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Business & Location Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Registration */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Business Registration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="27AAAAA0000A1Z5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => handleInputChange('panNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="AAAAA0000A"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Address Information</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complete Address *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter complete business address"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.city ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select city</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.state ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select state</option>
                          {states.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.pincode ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="400001"
                        />
                        {errors.pincode && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.pincode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="India"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Document Upload (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: 'companyProfile', label: 'Company Profile' },
                      { key: 'gstCertificate', label: 'GST Certificate' },
                      { key: 'panCard', label: 'PAN Card' },
                      { key: 'productCatalog', label: 'Product Catalog' }
                    ].map((doc) => (
                      <div key={doc.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {doc.label}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Click to upload or drag and drop
                          </p>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <Button size="sm" variant="outline">
                            Choose File
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Exhibition Details */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Exhibition Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Booth Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Booth Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Booth Size *
                      </label>
                      <select
                        value={formData.boothSize}
                        onChange={(e) => handleInputChange('boothSize', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.boothSize ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select booth size</option>
                        {boothSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      {errors.boothSize && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.boothSize}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booth Preference
                      </label>
                      <input
                        type="text"
                        value={formData.boothPreference}
                        onChange={(e) => handleInputChange('boothPreference', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Corner booth, near entrance, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Exhibition Experience */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Exhibition Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Visitors *
                      </label>
                      <input
                        type="number"
                        value={formData.expectedVisitors}
                        onChange={(e) => handleInputChange('expectedVisitors', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.expectedVisitors ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="100"
                        min="1"
                      />
                      {errors.expectedVisitors && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.expectedVisitors}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Business owners, consumers, professionals, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Products & Services */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Products & Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Products to Showcase
                      </label>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newProduct}
                            onChange={(e) => setNewProduct(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter product name"
                            onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                          />
                          <Button type="button" onClick={addProduct} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.products.map((product, index) => (
                            <Badge key={index} variant="default" className="flex items-center space-x-1">
                              <span>{product}</span>
                              <button
                                type="button"
                                onClick={() => removeProduct(index)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Services Offered
                      </label>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter service name"
                            onKeyPress={(e) => e.key === 'Enter' && addService()}
                          />
                          <Button type="button" onClick={addService} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.services.map((service, index) => (
                            <Badge key={index} variant="default" className="flex items-center space-x-1">
                              <span>{service}</span>
                              <button
                                type="button"
                                onClick={() => removeService(index)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Power requirements, internet, storage, setup assistance, etc."
                  />
                </div>

                {/* Previous Exhibitions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Exhibition Experience
                  </label>
                  <textarea
                    value={formData.previousExhibitions}
                    onChange={(e) => handleInputChange('previousExhibitions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List previous exhibitions, trade shows, or events participated in..."
                  />
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Payment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={formData.registrationFee}
                          onChange={(e) => handleInputChange('registrationFee', parseInt(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="online">Online Payment</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sendConfirmationEmail"
                        checked={formData.sendConfirmationEmail}
                        onChange={(e) => handleInputChange('sendConfirmationEmail', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sendConfirmationEmail" className="ml-2 block text-sm text-gray-700">
                        Send confirmation email with booth details
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowMarketingEmails"
                        checked={formData.allowMarketingEmails}
                        onChange={(e) => handleInputChange('allowMarketingEmails', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="allowMarketingEmails" className="ml-2 block text-sm text-gray-700">
                        Allow marketing and promotional emails
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Review & Submit
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Company Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {formData.companyName}</div>
                        <div><strong>Category:</strong> {formData.category}</div>
                        <div><strong>Business Type:</strong> {formData.businessType}</div>
                        <div><strong>Website:</strong> {formData.website || 'Not provided'}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Contact Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Contact Person:</strong> {formData.contactPerson}</div>
                        <div><strong>Designation:</strong> {formData.designation}</div>
                        <div><strong>Email:</strong> {formData.email}</div>
                        <div><strong>Phone:</strong> {formData.phone}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>City:</strong> {formData.city}</div>
                        <div><strong>State:</strong> {formData.state}</div>
                        <div><strong>Pincode:</strong> {formData.pincode}</div>
                        <div><strong>GST:</strong> {formData.gstNumber || 'Not provided'}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Exhibition Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Booth Size:</strong> {formData.boothSize}</div>
                        <div><strong>Expected Visitors:</strong> {formData.expectedVisitors}</div>
                        <div><strong>Registration Fee:</strong> ₹{formData.registrationFee.toLocaleString()}</div>
                        <div><strong>Payment Method:</strong> {formData.paymentMethod.replace('_', ' ')}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Products & Services */}
                {(formData.products.length > 0 || formData.services.length > 0) && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Products & Services</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.products.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Products:</h5>
                            <div className="flex flex-wrap gap-1">
                              {formData.products.map((product, index) => (
                                <Badge key={index} variant="default" className="text-xs">
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {formData.services.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Services:</h5>
                            <div className="flex flex-wrap gap-1">
                              {formData.services.map((service, index) => (
                                <Badge key={index} variant="default" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Terms & Conditions */}
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Registration fee is non-refundable after booth allocation</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Booth setup must comply with event guidelines and safety regulations</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Exhibitor is responsible for booth decoration and product display</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Event organizers reserve the right to modify booth assignments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                        I accept the terms and conditions
                      </label>
                    </div>
                  </div>
                  
                  {errors.submit && (
                    <div className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.submit}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Step Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Current Step</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {React.createElement(steps[currentStep - 1].icon, { className: "h-8 w-8 text-blue-600" })}
                </div>
                <h4 className="font-medium text-gray-900">{steps[currentStep - 1].title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Step {currentStep} of {steps.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Preview */}
          {formData.category && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Category Preview</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{formData.category}</span>
                    <Badge variant="info">{formData.category}</Badge>
                  </div>
                  {formData.subCategory && (
                    <div className="text-sm text-gray-600">
                      <strong>Sub-category:</strong> {formData.subCategory}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <strong>Suggested booth size:</strong> 3x3 meters or larger
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Typical visitors:</strong> Business professionals, consumers, industry experts
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help & Guidelines */}
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
                  <p>Provide accurate company information for verification</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Upload relevant documents to speed up approval</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Choose booth size based on your display requirements</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Registration fee varies by booth size and location</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="space-y-3">
            {currentStep < 5 ? (
              <>
                <Button
                  onClick={nextStep}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <span>Continue to Next Step</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous Step</span>
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Register Exhibitor</span>
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate('/exhibitors')}
              className="w-full"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};