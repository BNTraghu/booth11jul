import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Eye, 
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  FileText,
  Send,
  Edit,
  X,
  Save,
  Star,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unlimited?: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  maxEvents: number;
  maxAttendees: number;
  maxSocieties: number;
  supportLevel: 'email' | 'phone' | 'priority' | 'dedicated';
  support: string;
  popular?: boolean;
  isActive: boolean;
  trialDays: number;
  setupFee: number;
  discountPercentage: number;
  customBranding: boolean;
  apiAccess: boolean;
  advancedReporting: boolean;
  whiteLabel: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  societyName: string;
  planName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod?: string;
}

interface Subscription {
  id: string;
  societyName: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  monthlyAmount: number;
}

const defaultFeatures: PlanFeature[] = [
  {
    id: '1',
    name: 'Event Management',
    description: 'Create and manage events',
    included: true
  },
  {
    id: '2',
    name: 'Attendee Registration',
    description: 'Online registration system',
    included: true
  },
  {
    id: '3',
    name: 'Basic Analytics',
    description: 'Event performance metrics',
    included: true
  },
  {
    id: '4',
    name: 'Email Notifications',
    description: 'Automated email communications',
    included: true
  },
  {
    id: '5',
    name: 'Mobile App Access',
    description: 'iOS and Android apps',
    included: true
  },
  {
    id: '6',
    name: 'Vendor Management',
    description: 'Manage service providers',
    included: false
  },
  {
    id: '7',
    name: 'Advanced Reporting',
    description: 'Detailed analytics and reports',
    included: false
  },
  {
    id: '8',
    name: 'Custom Branding',
    description: 'White-label solution',
    included: false
  },
  {
    id: '9',
    name: 'API Access',
    description: 'Integration capabilities',
    included: false
  },
  {
    id: '10',
    name: 'Priority Support',
    description: '24/7 priority assistance',
    included: false
  }
];

const supportLevels = {
  email: { label: 'Email Support', description: 'Email support during business hours', icon: '📧' },
  phone: { label: 'Phone & Email', description: 'Phone and email support', icon: '📞' },
  priority: { label: 'Priority Support', description: '24/7 priority support', icon: '⚡' },
  dedicated: { label: 'Dedicated Manager', description: 'Dedicated account manager', icon: '👤' }
};

const initialPlans: Plan[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'Perfect for small societies',
    price: 2999,
    billingCycle: 'monthly',
    features: [
      'Up to 5 events per month',
      'Basic event management',
      'Email support',
      'Standard reporting',
      'Mobile app access'
    ],
    maxEvents: 5,
    maxAttendees: 200,
    maxSocieties: 1,
    supportLevel: 'email',
    support: 'Email',
    isActive: true,
    trialDays: 14,
    setupFee: 0,
    discountPercentage: 0,
    customBranding: false,
    apiAccess: false,
    advancedReporting: false,
    whiteLabel: false
  },
  {
    id: '2',
    name: 'Professional',
    description: 'Ideal for growing communities',
    price: 5999,
    billingCycle: 'monthly',
    features: [
      'Up to 15 events per month',
      'Advanced event management',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'Vendor management'
    ],
    maxEvents: 15,
    maxAttendees: 500,
    maxSocieties: 3,
    supportLevel: 'phone',
    support: 'Phone & Email',
    popular: true,
    isActive: true,
    trialDays: 14,
    setupFee: 0,
    discountPercentage: 10,
    customBranding: true,
    apiAccess: false,
    advancedReporting: true,
    whiteLabel: false
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large societies and organizations',
    price: 12999,
    billingCycle: 'monthly',
    features: [
      'Unlimited events',
      'Full platform access',
      '24/7 dedicated support',
      'Custom integrations',
      'White-label solution',
      'Advanced security',
      'API access'
    ],
    maxEvents: -1,
    maxAttendees: -1,
    maxSocieties: -1,
    supportLevel: 'dedicated',
    support: '24/7 Dedicated',
    isActive: true,
    trialDays: 30,
    setupFee: 5000,
    discountPercentage: 15,
    customBranding: true,
    apiAccess: true,
    advancedReporting: true,
    whiteLabel: true
  }
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    societyName: 'Sunset Heights Society',
    planName: 'Professional',
    amount: 5999,
    issueDate: '2024-01-01',
    dueDate: '2024-01-15',
    status: 'paid',
    paymentMethod: 'Credit Card'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    societyName: 'Green Valley Residency',
    planName: 'Enterprise',
    amount: 12999,
    issueDate: '2024-01-05',
    dueDate: '2024-01-20',
    status: 'pending'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    societyName: 'Royal Gardens Complex',
    planName: 'Basic',
    amount: 2999,
    issueDate: '2023-12-15',
    dueDate: '2023-12-30',
    status: 'overdue'
  }
];

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    societyName: 'Sunset Heights Society',
    planName: 'Professional',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    autoRenew: true,
    monthlyAmount: 5999
  },
  {
    id: '2',
    societyName: 'Green Valley Residency',
    planName: 'Enterprise',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    autoRenew: true,
    monthlyAmount: 12999
  },
  {
    id: '3',
    societyName: 'Royal Gardens Complex',
    planName: 'Basic',
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    status: 'expired',
    autoRenew: false,
    monthlyAmount: 2999
  }
];

export const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices' | 'subscriptions'>('plans');
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Plan | null>(null);
  const [editFeatures, setEditFeatures] = useState<PlanFeature[]>([]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': case 'active': return 'success';
      case 'pending': return 'warning';
      case 'overdue': case 'expired': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': case 'expired': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalRevenue = mockInvoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.amount : 0), 0);
  const pendingAmount = mockInvoices.reduce((sum, inv) => sum + (inv.status === 'pending' ? inv.amount : 0), 0);
  const overdueAmount = mockInvoices.reduce((sum, inv) => sum + (inv.status === 'overdue' ? inv.amount : 0), 0);

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setEditFormData({ ...plan });
    
    // Initialize features for editing
    const planFeatures = defaultFeatures.map(feature => ({
      ...feature,
      included: plan.features.some(f => f.toLowerCase().includes(feature.name.toLowerCase()))
    }));
    setEditFeatures(planFeatures);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      // Update features based on selected ones
      const updatedFeatures = editFeatures
        .filter(f => f.included)
        .map(f => f.name);
      
      const updatedPlan = {
        ...editFormData,
        features: updatedFeatures
      };

      setPlans(prev => prev.map(plan => 
        plan.id === editFormData.id ? updatedPlan : plan
      ));
      
      setShowEditModal(false);
      setEditFormData(null);
      setEditFeatures([]);
      setSelectedPlan(null);
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    setEditFeatures(prev => prev.map(feature =>
      feature.id === featureId
        ? { ...feature, included: !feature.included }
        : feature
    ));
  };

  const addCustomFeature = () => {
    const newFeature: PlanFeature = {
      id: Date.now().toString(),
      name: '',
      description: '',
      included: true
    };
    
    setEditFeatures(prev => [...prev, newFeature]);
  };

  const updateCustomFeature = (featureId: string, field: string, value: any) => {
    setEditFeatures(prev => prev.map(feature =>
      feature.id === featureId
        ? { ...feature, [field]: value }
        : feature
    ));
  };

  const removeCustomFeature = (featureId: string) => {
    setEditFeatures(prev => prev.filter(feature => feature.id !== featureId));
  };

  const closeModals = () => {
    setShowPlanModal(false);
    setShowEditModal(false);
    setSelectedPlan(null);
    setEditFormData(null);
    setEditFeatures([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Plans & Billing</h1>
          <p className="text-gray-600">Manage subscription plans and billing information</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Link to="/billing/plans/create">
            <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
              <Plus className="h-4 w-4" />
              <span>New Plan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{mockInvoices.filter(i => i.status === 'pending').length} invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{overdueAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{mockInvoices.filter(i => i.status === 'overdue').length} invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{mockSubscriptions.filter(s => s.status === 'active').length}</p>
                <p className="text-sm text-gray-500">Monthly recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'plans', label: 'Subscription Plans', count: plans.length },
            { id: 'invoices', label: 'Invoices', count: mockInvoices.length },
            { id: 'subscriptions', label: 'Active Subscriptions', count: mockSubscriptions.filter(s => s.status === 'active').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
            <Link to="/billing/plans/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New Plan</span>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Max Events:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          {plan.maxEvents === -1 ? 'Unlimited' : plan.maxEvents}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Attendees:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          {plan.maxAttendees === -1 ? 'Unlimited' : plan.maxAttendees}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Support:</span>
                      <span className="font-medium text-gray-900 ml-2">{plan.support}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1" 
                      variant={plan.popular ? 'primary' : 'outline'}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowPlanModal(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Society</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      {invoice.paymentMethod && (
                        <div className="text-sm text-gray-500">{invoice.paymentMethod}</div>
                      )}
                    </TableCell>
                    <TableCell>{invoice.societyName}</TableCell>
                    <TableCell>
                      <Badge variant="default">{invoice.planName}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">₹{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(invoice.status)}
                        <Badge variant={getStatusVariant(invoice.status)} className="ml-2">
                          {invoice.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Send className="h-4 w-4" />
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

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Active Subscriptions</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Society</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Monthly Amount</TableHead>
                  <TableHead>Auto Renew</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.societyName}</TableCell>
                    <TableCell>
                      <Badge variant="default">{subscription.planName}</Badge>
                    </TableCell>
                    <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">₹{subscription.monthlyAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={subscription.autoRenew ? 'success' : 'warning'}>
                        {subscription.autoRenew ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(subscription.status)}
                        <Badge variant={getStatusVariant(subscription.status)} className="ml-2">
                          {subscription.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <FileText className="h-4 w-4" />
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

      {/* Plan Detail Modal */}
      {showPlanModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name} Plan</h2>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ₹{selectedPlan.price.toLocaleString()}<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">{selectedPlan.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Plan Limits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Events:</span>
                      <span className="font-medium">
                        {selectedPlan.maxEvents === -1 ? 'Unlimited' : selectedPlan.maxEvents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Attendees:</span>
                      <span className="font-medium">
                        {selectedPlan.maxAttendees === -1 ? 'Unlimited' : selectedPlan.maxAttendees}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Support:</span>
                      <span className="font-medium">{selectedPlan.support}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Features Included</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowPlanModal(false)}>
                  Close
                </Button>
                <Button>
                  Assign to Society
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Plan: {editFormData.name}</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Plan Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                          <select
                            value={editFormData.billingCycle}
                            onChange={(e) => setEditFormData({...editFormData, billingCycle: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                          <input
                            type="number"
                            value={editFormData.price}
                            onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Setup Fee (₹)</label>
                          <input
                            type="number"
                            value={editFormData.setupFee}
                            onChange={(e) => setEditFormData({...editFormData, setupFee: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                          <input
                            type="number"
                            value={editFormData.discountPercentage}
                            onChange={(e) => setEditFormData({...editFormData, discountPercentage: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Limits */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Limits</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Events per Month</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editFormData.maxEvents === -1 ? '' : editFormData.maxEvents}
                              onChange={(e) => setEditFormData({...editFormData, maxEvents: parseInt(e.target.value) || 0})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={editFormData.maxEvents === -1}
                            />
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editFormData.maxEvents === -1}
                                onChange={(e) => setEditFormData({...editFormData, maxEvents: e.target.checked ? -1 : 5})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees per Event</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editFormData.maxAttendees === -1 ? '' : editFormData.maxAttendees}
                              onChange={(e) => setEditFormData({...editFormData, maxAttendees: parseInt(e.target.value) || 0})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={editFormData.maxAttendees === -1}
                            />
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editFormData.maxAttendees === -1}
                                onChange={(e) => setEditFormData({...editFormData, maxAttendees: e.target.checked ? -1 : 200})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Societies</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editFormData.maxSocieties === -1 ? '' : editFormData.maxSocieties}
                              onChange={(e) => setEditFormData({...editFormData, maxSocieties: parseInt(e.target.value) || 0})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={editFormData.maxSocieties === -1}
                            />
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editFormData.maxSocieties === -1}
                                onChange={(e) => setEditFormData({...editFormData, maxSocieties: e.target.checked ? -1 : 1})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Support Level</label>
                          <select
                            value={editFormData.supportLevel}
                            onChange={(e) => setEditFormData({...editFormData, supportLevel: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {Object.entries(supportLevels).map(([key, level]) => (
                              <option key={key} value={key}>
                                {level.icon} {level.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Free Trial (Days)</label>
                          <input
                            type="number"
                            value={editFormData.trialDays}
                            onChange={(e) => setEditFormData({...editFormData, trialDays: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            max="90"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Plan Features</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomFeature}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Feature</span>
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {editFeatures.map((feature, index) => (
                        <div key={feature.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={feature.included}
                              onChange={() => handleFeatureToggle(feature.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            {index >= defaultFeatures.length ? (
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={feature.name}
                                  onChange={(e) => updateCustomFeature(feature.id, 'name', e.target.value)}
                                  placeholder="Feature name"
                                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                  type="text"
                                  value={feature.description}
                                  onChange={(e) => updateCustomFeature(feature.id, 'description', e.target.value)}
                                  placeholder="Feature description"
                                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-gray-900">{feature.name}</div>
                                <div className="text-sm text-gray-500">{feature.description}</div>
                              </div>
                            )}
                          </div>
                          {index >= defaultFeatures.length && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomFeature(feature.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.popular}
                            onChange={(e) => setEditFormData({...editFormData, popular: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Mark as Popular</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.isActive}
                            onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Active Plan</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.customBranding}
                            onChange={(e) => setEditFormData({...editFormData, customBranding: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Custom Branding</span>
                        </label>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.apiAccess}
                            onChange={(e) => setEditFormData({...editFormData, apiAccess: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">API Access</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.advancedReporting}
                            onChange={(e) => setEditFormData({...editFormData, advancedReporting: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Advanced Reporting</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.whiteLabel}
                            onChange={(e) => setEditFormData({...editFormData, whiteLabel: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">White Label Solution</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Plan Preview */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Preview</h3>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-center mb-4">
                        {editFormData.popular && (
                          <div className="flex justify-center mb-2">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              Most Popular
                            </span>
                          </div>
                        )}
                        <h4 className="text-xl font-bold text-gray-900">{editFormData.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{editFormData.description}</p>
                        <div className="mt-3">
                          <span className="text-3xl font-bold text-gray-900">₹{editFormData.price.toLocaleString()}</span>
                          <span className="text-gray-600">/{editFormData.billingCycle}</span>
                          {editFormData.discountPercentage > 0 && (
                            <div className="text-sm text-green-600 mt-1">
                              Save {editFormData.discountPercentage}% on {editFormData.billingCycle} billing
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Events:</span>
                          <span className="font-medium">
                            {editFormData.maxEvents === -1 ? 'Unlimited' : editFormData.maxEvents}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Attendees:</span>
                          <span className="font-medium">
                            {editFormData.maxAttendees === -1 ? 'Unlimited' : editFormData.maxAttendees}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Societies:</span>
                          <span className="font-medium">
                            {editFormData.maxSocieties === -1 ? 'Unlimited' : editFormData.maxSocieties}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Support:</span>
                          <span className="font-medium">{supportLevels[editFormData.supportLevel].label}</span>
                        </div>
                        {editFormData.trialDays > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trial:</span>
                            <span className="font-medium">{editFormData.trialDays} days</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Included Features ({editFeatures.filter(f => f.included).length})
                        </div>
                        <div className="space-y-1">
                          {editFeatures.filter(f => f.included).slice(0, 5).map((feature) => (
                            <div key={feature.id} className="flex items-center text-xs text-gray-600">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              <span className="truncate">{feature.name}</span>
                            </div>
                          ))}
                          {editFeatures.filter(f => f.included).length > 5 && (
                            <div className="text-xs text-gray-500">
                              +{editFeatures.filter(f => f.included).length - 5} more features
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <Button variant="outline" onClick={closeModals}>Cancel</Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};