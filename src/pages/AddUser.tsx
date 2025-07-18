import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  password: string;
  confirmPassword: string;
  status: 'active' | 'inactive';
  sendWelcomeEmail: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const rolePermissions = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access and control',
    permissions: ['All system permissions', 'User management', 'System configuration', 'Global reports'],
    color: 'error'
  },
  admin: {
    label: 'City Admin',
    description: 'City-level administration',
    permissions: ['City management', 'Event management', 'Society management', 'Local reports'],
    color: 'warning'
  },
  support_tech: {
    label: 'Support Tech',
    description: 'Technical support and assistance',
    permissions: ['Event support', 'User assistance', 'Technical troubleshooting', 'System monitoring'],
    color: 'info'
  },
  sales_marketing: {
    label: 'Sales & Marketing',
    description: 'Sales and marketing operations',
    permissions: ['Lead management', 'Marketing campaigns', 'Sales reports', 'Customer relations'],
    color: 'success'
  },
  accounting: {
    label: 'Accounting',
    description: 'Financial management',
    permissions: ['Financial reports', 'Invoice management', 'Payment tracking', 'Billing operations'],
    color: 'default'
  },
  logistics: {
    label: 'Logistics',
    description: 'Vendor and supply management',
    permissions: ['Vendor management', 'Supply chain', 'Inventory management', 'Logistics coordination'],
    color: 'default'
  }
};

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad'];

export const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    city: '',
    password: '',
    confirmPassword: '',
    status: 'active',
    sendWelcomeEmail: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Only super admins can access this page
  if (!hasRole(['super_admin'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to add users.</p>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // City validation (required for non-super admin roles)
    if (formData.role !== 'super_admin' && !formData.city) {
      newErrors.city = 'City is required for this role';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            city: formData.role === 'super_admin' ? null : formData.city,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Step 2: Insert user profile into public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          role: formData.role as UserRole,
          city: formData.role === 'super_admin' ? null : formData.city,
          phone: formData.phone,
          status: formData.status
        });

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        // In a production app, you might want to handle this more gracefully
        console.error('Profile creation failed:', profileError);
        throw new Error('Failed to create user profile: ' + profileError.message);
      }
      
      console.log('User created successfully:', {
        id: authData.user.id,
        email: formData.email,
        name: formData.name,
        role: formData.role
      });
      
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/users');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = formData.role ? rolePermissions[formData.role as keyof typeof rolePermissions] : null;

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              The new user has been created and can now log in with their credentials.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/users')} className="w-full">
                Go to User Management
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: '',
                    city: '',
                    password: '',
                    confirmPassword: '',
                    status: 'active',
                    sendWelcomeEmail: true
                  });
                }}
                className="w-full"
              >
                Add Another User
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
            onClick={() => navigate('/users')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Users</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New User</h1>
            <p className="text-gray-600">Create a new user account with appropriate permissions</p>
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
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
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
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Role & Permissions
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.role ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a role</option>
                      {Object.entries(rolePermissions).map(([key, role]) => (
                        <option key={key} value={key}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.role}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City Assignment {formData.role !== 'super_admin' && '*'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={formData.role === 'super_admin'}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        } ${formData.role === 'super_admin' ? 'bg-gray-100' : ''}`}
                      >
                        <option value="">
                          {formData.role === 'super_admin' ? 'All Cities' : 'Select a city'}
                        </option>
                        {formData.role !== 'super_admin' && cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
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

            {/* Security */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onChange={(e) => handleInputChange('sendWelcomeEmail', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled
                  />
                  <label htmlFor="sendWelcomeEmail" className="ml-2 block text-sm text-gray-700">
                    Send welcome email with login credentials (Coming soon)
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Preview */}
            {selectedRole && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Role Preview</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{selectedRole.label}</h4>
                      <Badge variant={selectedRole.color as any}>
                        {formData.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600">{selectedRole.description}</p>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h5>
                      <ul className="space-y-1">
                        {selectedRole.permissions.map((permission, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {permission}
                          </li>
                        ))}
                      </ul>
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
                    <p>Choose the appropriate role based on the user's responsibilities</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>City assignment is required for all roles except Super Admin</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Strong passwords are enforced for security</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Welcome emails include login instructions</p>
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
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating User...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create User</span>
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/users')}
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