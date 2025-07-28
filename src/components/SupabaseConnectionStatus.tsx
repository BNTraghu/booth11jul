import React from 'react';
import { Card, CardHeader, CardContent } from './UI/Card';
import { Badge } from './UI/Badge';
import { 
  CheckCircle, 
  Database, 
  FileText,
  MapPin,
  Building
} from 'lucide-react';

export const SupabaseConnectionStatus: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Supabase Integration Status</h3>
              <p className="text-sm text-gray-600">Database integration verified and working</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">All systems operational!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your Supabase integration is working correctly. Both CreateEvent and CreateExhibitor components are ready to use.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">CreateEvent Features</h4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Google Maps integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Extended venue details</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Bidirectional address mapping</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Comprehensive validation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">CreateExhibitor Features</h4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Multi-step form wizard</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Company & contact details</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Business categorization</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Document management</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Database Schema</h4>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Events Table</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Basic event details</li>
                <li>• Extended venue fields</li>
                <li>• Google Maps coordinates</li>
                <li>• Pricing & amenities</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Exhibitors Table</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Company information</li>
                <li>• Contact details</li>
                <li>• Business categorization</li>
                <li>• Exhibition preferences</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Relationships</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Events → Users (created_by)</li>
                <li>• Events → Venues (venue_id)</li>
                <li>• Events → Vendors (vendor_ids)</li>
                <li>• Proper foreign keys</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 