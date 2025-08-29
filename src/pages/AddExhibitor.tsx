import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  validateEmail, 
  validatePhone, 
  validatePinCode, 
  validateRequiredText,
  validateNumber
} from '../utils/validation';
import {
  Save,
  ArrowLeft,
  Building,
  User,
  Mail,
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
import { PhoneInput } from '../components/UI/PhoneInput';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import statesData from '../data/states.json';

interface FormData {
  // Legacy fields for backward compatibility
  products: string[];
  services: string[];
  companyDescription: string;
  establishedYear: string;
  companySize: string;
  designation: string;
  alternateEmail: string;
  businessType: string;
  boothPreference: string;
  specialRequirements: string;
  previousExhibitions: string;
  expectedVisitors: string;
  targetAudience: string;
  registrationFee: number;
  paymentMethod: string;
  billingAddress: string;
  contactPerson: string;
  address: string;
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;

  // Business Information
  companyName: string;
  website: string;
  category: string;
  subCategory: string;
  panNumber: string;
  gstNumber: string;
  boothSize: string;
  businessDescription: string;
  socialMediaLinks: {
    facebook: string;
    linkedin: string;
    instagram: string;
    twitter: string;
  };

  // Address
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;


  // Documents
  documents: {
    panCard: File | null;
    aadharCard: File | null;
    licence: File | null;
  };

  // Upload Images
  images: File[];

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

export const AddExhibitor: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',

    // Business Information
    companyName: '',
    website: '',
    category: '',
    subCategory: '',
    panNumber: '',
    gstNumber: '',
    boothSize: '',
    businessDescription: '',
    socialMediaLinks: {
      facebook: '',
      linkedin: '',
      instagram: '',
      twitter: ''
    },

    // Address
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',

    // Documents
    documents: {
      panCard: null,
      aadharCard: null,
      licence: null
    },

    // Upload Images
    images: [],

    // Settings
    status: 'registered',
    paymentStatus: 'pending',

    // Add all missing fields to match FormData type
    sendConfirmationEmail: false,
    allowMarketingEmails: false,

    // Add missing fields based on FormData interface
    products: [],
    services: [],
    companyDescription: '',
    establishedYear: '',
    businessType: '',
    companySize: '',
    designation: '',
    alternateEmail: '',
    boothPreference: '',
    specialRequirements: '',
    previousExhibitions: '',
    expectedVisitors: '',
    targetAudience: '',
    registrationFee: 15000,
    paymentMethod: 'online',
    billingAddress: '',
    contactPerson: '',
    address: ''
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
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Contact number is required';
        else if (formData.phone.length !== 10) newErrors.phone = 'Contact number must be exactly 10 digits';
        else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Contact number must contain only digits';

        // Validate alternate phone if provided
        if (formData.alternatePhone.trim()) {
          if (formData.alternatePhone.length !== 10) newErrors.alternatePhone = 'Alternate contact number must be exactly 10 digits';
          else if (!/^[0-9]{10}$/.test(formData.alternatePhone)) newErrors.alternatePhone = 'Alternate contact number must contain only digits';
        }
        break;

      case 2: // Address
        if (!formData.address1.trim()) newErrors.address1 = 'Address line 1 is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        break;

      case 3: // Business Information
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
        break;

      case 4: // Documents
        if (!formData.documents.panCard) newErrors.panCard = 'PAN card is required';
        if (!formData.documents.aadharCard) newErrors.aadharCard = 'Aadhar card is required';
        break;

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.') as [keyof FormData, string];;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent] as any),
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });

    // Real-time validation
    let validationResult = null;
    
    switch (field) {
      case 'firstName':
        validationResult = validateRequiredText(value, 'First name', 2, 50);
        break;
      case 'lastName':
        validationResult = validateRequiredText(value, 'Last name', 2, 50);
        break;
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'phone':
        validationResult = validatePhone(value);
        break;
      case 'alternatePhone':
        if (value.trim()) {
          validationResult = validatePhone(value);
        }
        break;
      case 'address1':
        validationResult = validateRequiredText(value, 'Address', 5, 200);
        break;
      case 'city':
        validationResult = validateRequiredText(value, 'City', 2, 50);
        break;
      case 'state':
        validationResult = validateRequiredText(value, 'State', 2, 50);
        break;
      case 'pincode':
        validationResult = validatePinCode(value);
        break;
      case 'companyName':
        validationResult = validateRequiredText(value, 'Company name', 2, 100);
        break;
      case 'panNumber':
        if (value.trim()) {
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.trim())) {
            validationResult = { isValid: false, message: 'PAN must be in format: ABCDE1234F' };
          }
        }
        break;
      case 'gstNumber':
        if (value.trim()) {
          if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[Z]{1}[A-Z0-9]{1}$/.test(value.trim())) {
            validationResult = { isValid: false, message: 'GST must be in format: 22AAAAA0000A1Z5' };
          }
        }
        break;
      case 'boothSize':
        validationResult = validateRequiredText(value, 'Booth size', 2, 50);
        break;
      case 'businessDescription':
        validationResult = validateRequiredText(value, 'Business description', 10, 500);
        break;
    }

    // Update errors based on validation result
    if (validationResult && !validationResult.isValid) {
      setErrors(prev => ({ ...prev, [field]: validationResult.message }));
    } else if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // File compression functions
  const compressImage = (file: File, maxSizeKB: number = 100): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions to reduce file size
        let { width, height } = img;
        const maxDimension = 1024; // Max width/height

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Try different quality levels to get under size limit
        const tryCompress = (quality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                });

                // Check if compressed file is under limit
                if (compressedFile.size <= maxSizeKB * 1024 || quality <= 0.1) {
                  resolve(compressedFile);
                } else {
                  // Try with lower quality
                  tryCompress(quality - 0.1);
                }
              } else {
                reject(new Error('Compression failed'));
              }
            },
            file.type,
            quality
          );
        };

        // Start with 90% quality
        tryCompress(0.9);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const compressPDF = async (file: File, maxSizeKB: number = 100): Promise<File> => {
    // For PDF files, we can't easily compress them in the browser
    // So we'll just return the original file and show a message
    // In a real app, you'd send this to a server for compression
    if (file.size <= maxSizeKB * 1024) {
      return file;
    }

    // If PDF is too large, we can't compress it client-side
    throw new Error(`PDF file is ${Math.round(file.size / 1024)}KB. Please compress it to under ${maxSizeKB}KB using online tools.`);
  };

  const compressFile = async (file: File, maxSizeKB: number = 100): Promise<File> => {
    if (file.size <= maxSizeKB * 1024) {
      return file; // File is already small enough
    }

    if (file.type.startsWith('image/')) {
      return await compressImage(file, maxSizeKB);
    } else if (file.type === 'application/pdf') {
      return await compressPDF(file, maxSizeKB);
    } else {
      throw new Error(`Cannot compress ${file.type} files. Please reduce file size manually.`);
    }
  };

  const handleFileUpload = async (field: string, file: File | null) => {
    if (file) {
      try {
        // Clear any previous errors
        setErrors(prev => ({ ...prev, [field]: '' }));

        // Show loading state
        setErrors(prev => ({ ...prev, [field]: 'Processing file...' }));

        // Validate file type first
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          setErrors(prev => ({ ...prev, [field]: 'Please upload only PDF, JPG, JPEG, or PNG files' }));
          return;
        }

        // Compress file if needed
        const compressedFile = await compressFile(file, 100);

        // Clear loading state
        setErrors(prev => ({ ...prev, [field]: '' }));

        // Update form data with compressed file
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [field]: compressedFile
          }
        }));

        // Show success message if file was compressed
        if (compressedFile.size < file.size) {
          const originalSizeKB = Math.round(file.size / 1024);
          const compressedSizeKB = Math.round(compressedFile.size / 1024);
          console.log(`File compressed from ${originalSizeKB}KB to ${compressedSizeKB}KB`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
        setErrors(prev => ({ ...prev, [field]: errorMessage }));
      }
    } else {
      // Clear file if null
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: null
        }
      }));
    }
  };

  const uploadDocumentToSupabase = async (file: File, fileName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${fileName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('exhibitor-documents')
        .upload(filePath, file, {
          upsert: true
        });

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('exhibitor-documents')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const uploadImagesToSupabase = async (images: File[], exhibitorName: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${exhibitorName.replace(/\s+/g, '_')}_image_${i + 1}.${fileExt}`;

      try {
        const { data, error } = await supabase.storage
          .from('exhibitor-images')
          .upload(fileName, file, {
            upsert: true
          });

        if (error) {
          console.error('Error uploading image:', error);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('exhibitor-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        continue;
      }
    }

    return uploadedUrls;
  };

  const addProduct = () => {
    if (
      typeof newProduct === 'string' &&
      newProduct.trim() &&
      Array.isArray(formData.products) &&
      !formData.products.includes(newProduct.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        products: [...(prev.products || []), newProduct.trim()]
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
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create exhibitor name for file naming
      const exhibitorName = `${formData.firstName}_${formData.lastName}_${formData.companyName}`.replace(/\s+/g, '_');

      // Upload documents to Supabase Storage
      const documentUrls: { [key: string]: string } = {};

      if (formData.documents.panCard) {
        const panCardUrl = await uploadDocumentToSupabase(formData.documents.panCard, `${exhibitorName}_pan_card`);
        if (panCardUrl) documentUrls.panCard = panCardUrl;
      }

      if (formData.documents.aadharCard) {
        const aadharCardUrl = await uploadDocumentToSupabase(formData.documents.aadharCard, `${exhibitorName}_aadhar_card`);
        if (aadharCardUrl) documentUrls.aadharCard = aadharCardUrl;
      }

      if (formData.documents.licence) {
        const licenceUrl = await uploadDocumentToSupabase(formData.documents.licence, `${exhibitorName}_licence`);
        if (licenceUrl) documentUrls.licence = licenceUrl;
      }

      // Upload images to Supabase Storage
      const imageUrls = formData.images.length > 0
        ? await uploadImagesToSupabase(formData.images, exhibitorName)
        : [];

      const insertData = {
        // Personal Information
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        alternate_phone: formData.alternatePhone,

        // Business Information
        company_name: formData.companyName,
        website: formData.website,
        category: formData.category,
        sub_category: formData.subCategory,
        pan_number: formData.panNumber,
        gst_number: formData.gstNumber,
        booth_size: formData.boothSize,
        business_description: formData.businessDescription,
        facebook_url: formData.socialMediaLinks.facebook,
        linkedin_url: formData.socialMediaLinks.linkedin,
        instagram_url: formData.socialMediaLinks.instagram,
        twitter_url: formData.socialMediaLinks.twitter,

        // Address
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,

        // Document URLs
        document_urls: documentUrls,

        // Image URLs
        image_urls: imageUrls,

        // Settings
        status: formData.status,
        payment_status: formData.paymentStatus
      };

      const { data, error } = await supabase
        .from('exhibitors')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      showNotification('Exhibitor registered successfully!', 'success');
      setSubmitSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate('/exhibitors');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register exhibitor. Please try again.';
      setErrors({ submit: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
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

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Address', icon: MapPin },
    { number: 3, title: 'Business Information', icon: Building },
    { number: 4, title: 'Documents', icon: FileText },
    { number: 5, title: 'Upload Images', icon: Upload },
    { number: 6, title: 'Review & Submit', icon: CheckCircle }
  ];

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exhibitor Added Successfully!</h2>
            <p className="text-gray-600 mb-6">
              The exhibitor "{formData.companyName}" has been added to the system.
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
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
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
                  <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    Step {step.number}
                  </p>
                  <p className={`text-xs ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
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
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
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
                    <PhoneInput
                      label="Contact Number"
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      required={true}
                      error={errors.phone}
                      name="phone"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <PhoneInput
                    label="Alternate Contact Number"
                    value={formData.alternatePhone}
                    onChange={(value) => handleInputChange('alternatePhone', value)}
                    required={false}
                    error={errors.alternatePhone}
                    name="alternatePhone"
                    placeholder="9876543210"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => handleInputChange('address1', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address1 ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter street address"
                  />
                  {errors.address1 && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => handleInputChange('address2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                                          <select
                        value={formData.state}
                        onChange={(e) => {
                          handleInputChange('state', e.target.value);
                          handleInputChange('city', ''); // Clear city when state changes
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.state ? 'border-red-300' : 'border-gray-300'
                          }`}
                      >
                      <option value="">Select state</option>
                      {statesData.map((state) => (
                        <option key={state.id} value={state.name}>
                          {state.name}
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
                        City *
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!formData.state}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${errors.city ? 'border-red-300' : 'border-gray-300'
                          }`}
                      >
                        <option value="">Select city</option>
                        {formData.state && statesData
                          .find(s => s.name === formData.state)?.cities
                          .map(city => (
                            <option key={city} value={city}>{city}</option>
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
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pincode ? 'border-red-300' : 'border-gray-300'
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
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Business Information */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Business Information
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.companyName ? 'border-red-300' : 'border-gray-300'
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
                      Company Website
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-300'
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.panNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="AAAAA0000A"
                    />
                    {errors.panNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.panNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="27AAAAA0000A1Z5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Booth Size (Optional)
                  </label>
                  <select
                    value={formData.boothSize}
                    onChange={(e) => handleInputChange('boothSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select booth size</option>
                    {boothSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description (Optional)
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your business, products, and services..."
                  />
                </div>

                {/* Social Media Links */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Social Media Links (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documents
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Card *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload PAN Card
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('panCard', e.target.files?.[0] || null)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        id="panCard-upload"
                      />
                      <label
                        htmlFor="panCard-upload"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Choose File
                      </label>
                      {formData.documents.panCard && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {formData.documents.panCard.name}
                        </p>
                      )}
                    </div>
                    {errors.panCard && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.panCard}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Card *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload Aadhar Card
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('aadharCard', e.target.files?.[0] || null)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        id="aadharCard-upload"
                      />
                      <label
                        htmlFor="aadharCard-upload"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Choose File
                      </label>
                      {formData.documents.aadharCard && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {formData.documents.aadharCard.name}
                        </p>
                      )}
                    </div>
                    {errors.aadharCard && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.aadharCard}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Licence (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload Licence
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('licence', e.target.files?.[0] || null)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        id="licence-upload"
                      />
                      <label
                        htmlFor="licence-upload"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Choose File
                      </label>
                      {formData.documents.licence && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {formData.documents.licence.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                    <div className="text-sm">
                      <h4 className="font-medium text-blue-900">Document Guidelines</h4>
                      <ul className="mt-2 text-blue-700 space-y-1">
                        <li>• Upload clear, readable images or PDFs</li>
                        <li>• Maximum file size: 100KB per document</li>
                        <li>• Images will be automatically compressed if too large</li>
                        <li>• PDF files over 100KB need manual compression</li>
                        <li>• Accepted formats: PDF, JPG, JPEG, PNG</li>
                        <li>• PAN Card and Aadhar Card are mandatory</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Upload Images */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Images
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images
                    </label> */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400 mb-2 ml-4" />
                      {/* Upload Company Images */}
                    
                    {/* <p className="text-xs text-gray-600 mb-3">
                      Upload images of your company, products, or booth setup
                    </p> */}
                    <input
                      type="file"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        const validFiles: File[] = [];

                        // Show processing message
                        if (files.length > 0) {
                          setErrors(prev => ({ ...prev, images: 'Processing images...' }));
                        }

                        for (const file of files) {
                          try {
                            // Check file type first
                            if (!file.type.startsWith('image/')) {
                              setErrors(prev => ({
                                ...prev,
                                images: `File "${file.name}" is not a valid image.`
                              }));
                              continue;
                            }

                            // Compress image if needed
                            const compressedFile = await compressFile(file, 100);
                            validFiles.push(compressedFile);

                            // Log compression info
                            if (compressedFile.size < file.size) {
                              const originalSizeKB = Math.round(file.size / 1024);
                              const compressedSizeKB = Math.round(compressedFile.size / 1024);
                              console.log(`Image "${file.name}" compressed from ${originalSizeKB}KB to ${compressedSizeKB}KB`);
                            }

                          } catch (error) {
                            setErrors(prev => ({
                              ...prev,
                              images: `Failed to process "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
                            }));
                            continue;
                          }
                        }

                        if (validFiles.length > 0) {
                          // Clear errors if files are valid
                          setErrors(prev => ({ ...prev, images: '' }));
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, ...validFiles]
                          }));
                        }
                      }}
                      className="hidden"
                      accept="image/*"
                      id="images-upload"
                    />
                    <label
                      htmlFor="images-upload"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      Choose Images
                    </label>
                    </p>
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Selected Images ({formData.images.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.images.map((file, index) => (
                            <div key={index} className="relative">
                              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {errors.images && (
                    <div className="mt-4">
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.images}
                      </p>
                    </div>
                  )}
                </div>



                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex">
                    <Info className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                    <div className="text-xs">
                      <h4 className="font-medium text-green-900">Image Guidelines</h4>
                      <ul className="mt-1 text-green-700 space-y-0.5">
                        <li>• Upload high-quality images of your products or company</li>
                        <li>• Maximum file size: 100KB per image</li>
                        <li>• Large images will be automatically compressed</li>
                        <li>• Accepted formats: JPG, JPEG, PNG</li>
                        <li>• You can upload multiple images</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Review & Submit */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Review & Submit
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Simple Review Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">📋 Registration Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Personal Information</h5>
                      <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone}</p>
                      {formData.alternatePhone && <p><strong>Alt Phone:</strong> {formData.alternatePhone}</p>}
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Company Information</h5>
                      <p><strong>Company:</strong> {formData.companyName || 'Not provided'}</p>
                      <p><strong>Category:</strong> {formData.category || 'Not provided'}</p>
                      <p><strong>Sub Category:</strong> {formData.subCategory || 'Not provided'}</p>
                      {formData.website && <p><strong>Website:</strong> {formData.website}</p>}
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Address</h5>
                      <p><strong>Address:</strong> {formData.address1}</p>
                      {formData.address2 && <p>{formData.address2}</p>}
                      <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                      <p>{formData.country}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Documents & Images</h5>
                      <p><strong>PAN Card:</strong> {formData.documents.panCard ? '✅ Uploaded' : '❌ Missing'}</p>
                      <p><strong>Aadhar Card:</strong> {formData.documents.aadharCard ? '✅ Uploaded' : '❌ Missing'}</p>
                      <p><strong>Licence:</strong> {formData.documents.licence ? '✅ Uploaded' : 'Optional'}</p>
                      <p><strong>Images:</strong> {formData.images.length} uploaded</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                    <div className="text-sm">
                      <h4 className="font-medium text-green-900">Ready to Submit</h4>
                      <p className="mt-1 text-green-700">
                        Please review the information above and click "Register Exhibitor" to complete the registration.
                      </p>
                    </div>
                  </div>
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

          {/* Navigation Buttons */}
          <div className="space-y-3">
            {currentStep < 6 ? (
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