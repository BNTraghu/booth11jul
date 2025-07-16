import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Image,
  ExternalLink,
  Play,
  Pause,
  BarChart3,
  Target,
  MousePointer,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';

interface Advertisement {
  id: string;
  title: string;
  advertiser: string;
  type: 'banner' | 'video' | 'sponsored_post' | 'popup';
  placement: 'header' | 'sidebar' | 'footer' | 'event_page' | 'mobile_app';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  ctr: number; // Click-through rate
  cpm: number; // Cost per mille
}

interface Sponsor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  sponsorshipType: 'event' | 'society' | 'platform';
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze';
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  benefits: string[];
  eventsSponsored: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  targetAudience: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  ads: string[];
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
}

const mockAds: Advertisement[] = [
  {
    id: '1',
    title: 'Premium Event Management Software',
    advertiser: 'EventTech Solutions',
    type: 'banner',
    placement: 'header',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    budget: 50000,
    spent: 32000,
    impressions: 125000,
    clicks: 2500,
    status: 'active',
    ctr: 2.0,
    cpm: 256
  },
  {
    id: '2',
    title: 'Luxury Catering Services',
    advertiser: 'Royal Feast Catering',
    type: 'sponsored_post',
    placement: 'event_page',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    budget: 25000,
    spent: 25000,
    impressions: 85000,
    clicks: 1700,
    status: 'completed',
    ctr: 2.0,
    cpm: 294
  },
  {
    id: '3',
    title: 'Sound & Lighting Equipment',
    advertiser: 'ProAudio Systems',
    type: 'video',
    placement: 'sidebar',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    budget: 75000,
    spent: 18000,
    impressions: 45000,
    clicks: 900,
    status: 'active',
    ctr: 2.0,
    cpm: 400
  }
];

const mockSponsors: Sponsor[] = [
  {
    id: '1',
    companyName: 'TechCorp Industries',
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@techcorp.com',
    phone: '+91-9876543210',
    sponsorshipType: 'platform',
    sponsorshipLevel: 'platinum',
    amount: 500000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    benefits: ['Logo on all events', 'Dedicated booth space', 'Email marketing', 'Social media mentions'],
    eventsSponsored: 12
  },
  {
    id: '2',
    companyName: 'Green Energy Solutions',
    contactPerson: 'Priya Sharma',
    email: 'priya@greenenergy.com',
    phone: '+91-9876543211',
    sponsorshipType: 'event',
    sponsorshipLevel: 'gold',
    amount: 200000,
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    status: 'active',
    benefits: ['Event branding', 'Speaking opportunity', 'Networking sessions'],
    eventsSponsored: 5
  },
  {
    id: '3',
    companyName: 'Local Bank Ltd',
    contactPerson: 'Amit Patel',
    email: 'amit@localbank.com',
    phone: '+91-9876543212',
    sponsorshipType: 'society',
    sponsorshipLevel: 'silver',
    amount: 100000,
    startDate: '2023-12-01',
    endDate: '2024-02-29',
    status: 'expired',
    benefits: ['Society newsletter ads', 'ATM placement'],
    eventsSponsored: 3
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Event Promotion Campaign',
    description: 'Promoting upcoming events for Q1 2024',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    budget: 150000,
    spent: 95000,
    targetAudience: 'Society members aged 25-45',
    status: 'active',
    ads: ['1', '2'],
    performance: {
      impressions: 210000,
      clicks: 4200,
      conversions: 420,
      ctr: 2.0,
      cpc: 22.6
    }
  },
  {
    id: '2',
    name: 'Summer Festival Marketing',
    description: 'Marketing campaign for summer cultural festivals',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    budget: 200000,
    spent: 45000,
    targetAudience: 'Families and young adults',
    status: 'active',
    ads: ['3'],
    performance: {
      impressions: 85000,
      clicks: 1700,
      conversions: 170,
      ctr: 2.0,
      cpc: 26.5
    }
  }
];

export const AdsSponsors: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'ads' | 'sponsors'>('campaigns');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'expired': case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'platinum': return 'error';
      case 'gold': return 'warning';
      case 'silver': return 'default';
      case 'bronze': return 'info';
      default: return 'default';
    }
  };

  const totalAdSpend = mockAds.reduce((sum, ad) => sum + ad.spent, 0);
  const totalSponsorRevenue = mockSponsors.reduce((sum, sponsor) => sum + sponsor.amount, 0);
  const totalImpressions = mockAds.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = mockAds.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCTR = totalClicks > 0 ? (totalClicks / totalImpressions * 100) : 0;

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ads & Sponsors</h1>
          <p className="text-gray-600">Manage advertisements, sponsorships, and marketing campaigns</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Link to="/ads-sponsors/campaigns/create">
            <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ad Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalAdSpend.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sponsor Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(totalSponsorRevenue / 100000).toFixed(1)}L</p>
                <p className="text-sm text-gray-500">{mockSponsors.filter(s => s.status === 'active').length} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{(totalImpressions / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <MousePointer className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg CTR</p>
                <p className="text-2xl font-bold text-gray-900">{avgCTR.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Click-through rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'campaigns', label: 'Campaigns', count: mockCampaigns.length },
            { id: 'ads', label: 'Advertisements', count: mockAds.length },
            { id: 'sponsors', label: 'Sponsors', count: mockSponsors.length }
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

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Marketing Campaigns</h3>
            <Link to="/ads-sponsors/campaigns/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Campaign</span>
              </Button>
            </Link>
          </div>
          
          {mockCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-gray-600">{campaign.description}</p>
                  </div>
                  <Badge variant={getStatusVariant(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
                    <div className="text-2xl font-bold text-gray-900">₹{campaign.budget.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Spent: ₹{campaign.spent.toLocaleString()}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impressions:</span>
                        <span className="font-medium">{campaign.performance.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Clicks:</span>
                        <span className="font-medium">{campaign.performance.clicks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CTR:</span>
                        <span className="font-medium">{campaign.performance.ctr}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                    <div className="text-sm">
                      <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(campaign.endDate).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">Target: </span>
                      <span className="text-sm font-medium">{campaign.targetAudience}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(campaign)}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Campaign
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Advertisements Tab */}
      {activeTab === 'ads' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Active Advertisements</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ads..."
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
                  <TableHead>Advertisement</TableHead>
                  <TableHead>Type & Placement</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{ad.title}</div>
                        <div className="text-sm text-gray-500">{ad.advertiser}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="default">{ad.type.replace('_', ' ')}</Badge>
                        <div className="text-sm text-gray-500">{ad.placement.replace('_', ' ')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(ad.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(ad.endDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">₹{ad.budget.toLocaleString()}</div>
                        <div className="text-gray-500">Spent: ₹{ad.spent.toLocaleString()}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(ad.spent / ad.budget) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{ad.impressions.toLocaleString()} impressions</div>
                        <div>{ad.clicks.toLocaleString()} clicks</div>
                        <div className="text-gray-500">CTR: {ad.ctr}%</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(ad.status)}>
                        {ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(ad)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          {ad.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <BarChart3 className="h-4 w-4" />
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

      {/* Sponsors Tab */}
      {activeTab === 'sponsors' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Sponsor Partners</h3>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Sponsor</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Sponsorship</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSponsors.map((sponsor) => (
                  <TableRow key={sponsor.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{sponsor.companyName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{sponsor.contactPerson}</div>
                        <div className="text-gray-500">{sponsor.email}</div>
                        <div className="text-gray-500">{sponsor.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getLevelVariant(sponsor.sponsorshipLevel)}>
                          {sponsor.sponsorshipLevel}
                        </Badge>
                        <div className="text-sm text-gray-500 capitalize">
                          {sponsor.sponsorshipType.replace('_', ' ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{sponsor.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(sponsor.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(sponsor.endDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="font-medium">{sponsor.eventsSponsored}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sponsor.status)}>
                        {sponsor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(sponsor)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
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

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedItem.title || selectedItem.companyName || selectedItem.name}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Content varies based on item type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                  {/* Add specific details based on item type */}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                  {/* Add performance metrics */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};