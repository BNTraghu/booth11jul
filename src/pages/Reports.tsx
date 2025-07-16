import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar, 
  DollarSign, 
  Users, 
  Building2,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';

interface ReportData {
  period: string;
  events: number;
  revenue: number;
  attendees: number;
  societies: number;
  growth: number;
}

interface EventPerformance {
  id: string;
  name: string;
  date: string;
  attendees: number;
  revenue: number;
  satisfaction: number;
  roi: number;
}

interface CityPerformance {
  city: string;
  events: number;
  revenue: number;
  societies: number;
  growth: number;
}

const mockReportData: ReportData[] = [
  { period: 'Jan 2024', events: 45, revenue: 1250000, attendees: 8500, societies: 12, growth: 15.2 },
  { period: 'Feb 2024', events: 52, revenue: 1420000, attendees: 9200, societies: 14, growth: 18.5 },
  { period: 'Mar 2024', events: 48, revenue: 1380000, attendees: 8800, societies: 13, growth: 12.8 },
  { period: 'Apr 2024', events: 55, revenue: 1580000, attendees: 9800, societies: 15, growth: 22.1 },
  { period: 'May 2024', events: 61, revenue: 1720000, attendees: 10500, societies: 16, growth: 25.4 },
  { period: 'Jun 2024', events: 58, revenue: 1650000, attendees: 10200, societies: 15, growth: 19.7 }
];

const mockEventPerformance: EventPerformance[] = [
  { id: '1', name: 'Annual Cultural Festival', date: '2024-06-15', attendees: 450, revenue: 125000, satisfaction: 4.8, roi: 185 },
  { id: '2', name: 'Tech Innovation Summit', date: '2024-06-10', attendees: 320, revenue: 95000, satisfaction: 4.6, roi: 165 },
  { id: '3', name: 'Health & Wellness Expo', date: '2024-06-05', attendees: 280, revenue: 78000, satisfaction: 4.4, roi: 145 },
  { id: '4', name: 'Sports Championship', date: '2024-05-28', attendees: 520, revenue: 142000, satisfaction: 4.9, roi: 210 },
  { id: '5', name: 'Food Festival', date: '2024-05-20', attendees: 380, revenue: 105000, satisfaction: 4.7, roi: 175 }
];

const mockCityPerformance: CityPerformance[] = [
  { city: 'Mumbai', events: 85, revenue: 2450000, societies: 25, growth: 18.5 },
  { city: 'Delhi', events: 72, revenue: 2100000, societies: 22, growth: 15.2 },
  { city: 'Bangalore', events: 68, revenue: 1950000, societies: 20, growth: 22.1 },
  { city: 'Pune', events: 45, revenue: 1280000, societies: 15, growth: 12.8 },
  { city: 'Chennai', events: 38, revenue: 1050000, societies: 12, growth: 8.9 }
];

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'financial' | 'performance' | 'custom'>('overview');
  const [dateRange, setDateRange] = useState('last_6_months');
  const [selectedCity, setSelectedCity] = useState('all');

  const totalRevenue = mockReportData.reduce((sum, data) => sum + data.revenue, 0);
  const totalEvents = mockReportData.reduce((sum, data) => sum + data.events, 0);
  const totalAttendees = mockReportData.reduce((sum, data) => sum + data.attendees, 0);
  const avgGrowth = mockReportData.reduce((sum, data) => sum + data.growth, 0) / mockReportData.length;

  const currentMonth = mockReportData[mockReportData.length - 1];
  const previousMonth = mockReportData[mockReportData.length - 2];

  const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
  const eventGrowth = ((currentMonth.events - previousMonth.events) / previousMonth.events) * 100;
  const attendeeGrowth = ((currentMonth.attendees - previousMonth.attendees) / previousMonth.attendees) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_year">Last Year</option>
          </select>
          <Button variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                <div className="flex items-center mt-1">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                <div className="flex items-center mt-1">
                  {eventGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${eventGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(eventGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{(totalAttendees / 1000).toFixed(1)}K</p>
                <div className="flex items-center mt-1">
                  {attendeeGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${attendeeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(attendeeGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">{avgGrowth.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-gray-500">Monthly average</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'events', label: 'Event Performance', icon: Calendar },
            { id: 'financial', label: 'Financial Reports', icon: DollarSign },
            { id: 'performance', label: 'City Performance', icon: MapPin },
            { id: 'custom', label: 'Custom Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {mockReportData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm"
                      style={{ 
                        height: `${(data.revenue / Math.max(...mockReportData.map(d => d.revenue))) * 200}px`,
                        minHeight: '20px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2 text-center">
                      {data.period.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Monthly Revenue (₹ Lakhs)
              </div>
            </CardContent>
          </Card>

          {/* Event Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Event Distribution</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Cultural Events', count: 45, percentage: 35, color: 'bg-blue-500' },
                  { type: 'Corporate Events', count: 32, percentage: 25, color: 'bg-green-500' },
                  { type: 'Sports Events', count: 28, percentage: 22, color: 'bg-yellow-500' },
                  { type: 'Educational Events', count: 23, percentage: 18, color: 'bg-purple-500' }
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{item.type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Societies */}
          {/* Top Performing Venues */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Venues</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Sunset Heights Venue', events: 12, revenue: 345000, growth: 25.4 },
                  { name: 'Green Valley Convention Center', events: 10, revenue: 298000, growth: 18.7 },
                  { name: 'Royal Gardens Event Center', events: 8, revenue: 234000, growth: 15.2 },
                  { name: 'Paradise Event Hall', events: 6, revenue: 187000, growth: 12.8 }
                ].map((venue, index) => (
                  <div key={venue.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{venue.name}</div>
                        <div className="text-sm text-gray-500">{venue.events} events</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₹{(venue.revenue / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-green-600">+{venue.growth}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Statistics</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Avg Event Size', value: '285', unit: 'attendees', icon: Users },
                  { label: 'Avg Revenue/Event', value: '₹28K', unit: '', icon: DollarSign },
                  { label: 'Event Success Rate', value: '94.5', unit: '%', icon: Target },
                  { label: 'Avg Planning Time', value: '21', unit: 'days', icon: Clock }
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.unit}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Performance Tab */}
      {activeTab === 'events' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Event Performance Analysis</h3>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Satisfaction</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEventPerformance.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>{event.attendees}</TableCell>
                    <TableCell>₹{event.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{event.satisfaction}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${i < Math.floor(event.satisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.roi >= 150 ? 'success' : event.roi >= 100 ? 'warning' : 'error'}>
                        {event.roi}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
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

      {/* Financial Reports Tab */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { source: 'Event Fees', amount: 4250000, percentage: 65, color: 'bg-blue-500' },
                  { source: 'Vendor Commissions', amount: 1350000, percentage: 20, color: 'bg-green-500' },
                  { source: 'Sponsorships', amount: 650000, percentage: 10, color: 'bg-yellow-500' },
                  { source: 'Advertisements', amount: 325000, percentage: 5, color: 'bg-purple-500' }
                ].map((item) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{item.source}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        ₹{(item.amount / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Expense Analysis</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Vendor Payments', amount: 2100000, percentage: 45, color: 'bg-red-500' },
                  { category: 'Platform Costs', amount: 980000, percentage: 21, color: 'bg-orange-500' },
                  { category: 'Marketing', amount: 700000, percentage: 15, color: 'bg-pink-500' },
                  { category: 'Operations', amount: 560000, percentage: 12, color: 'bg-indigo-500' },
                  { category: 'Others', amount: 330000, percentage: 7, color: 'bg-gray-500' }
                ].map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        ₹{(item.amount / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* City Performance Tab */}
      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">City-wise Performance</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Societies</TableHead>
                  <TableHead>Growth Rate</TableHead>
                  <TableHead>Market Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCityPerformance.map((city) => (
                  <TableRow key={city.city}>
                    <TableCell className="font-medium">{city.city}</TableCell>
                    <TableCell>{city.events}</TableCell>
                    <TableCell>₹{(city.revenue / 100000).toFixed(1)}L</TableCell>
                    <TableCell>{city.societies}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {city.growth >= 15 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`font-medium ${city.growth >= 15 ? 'text-green-600' : 'text-red-600'}`}>
                          {city.growth}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(city.revenue / Math.max(...mockCityPerformance.map(c => c.revenue))) * 100}%` }}
                        ></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Custom Reports Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Report</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="revenue">Revenue Analysis</option>
                    <option value="attendance">Attendance Report</option>
                    <option value="venue">Venue Performance</option>
                    <option value="vendor">Vendor Analysis</option>
                    <option value="custom">Custom Metrics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="last_week">Last Week</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_quarter">Last Quarter</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="pdf">PDF Report</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV Data</option>
                    <option value="dashboard">Interactive Dashboard</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <Button className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Monthly Revenue Summary', type: 'Revenue', lastGenerated: '2024-06-01', format: 'PDF' },
                  { name: 'Q2 Performance Report', type: 'Performance', lastGenerated: '2024-05-30', format: 'Excel' },
                  { name: 'Venue Engagement Analysis', type: 'Venue', lastGenerated: '2024-05-28', format: 'Dashboard' },
                  { name: 'Vendor Performance Review', type: 'Vendor', lastGenerated: '2024-05-25', format: 'PDF' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge variant="default">{report.type}</Badge>
                        <span className="text-sm text-gray-500">Last generated: {report.lastGenerated}</span>
                        <span className="text-sm text-gray-500">Format: {report.format}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};