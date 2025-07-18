import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserPlus, Mail, Phone, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useSupabaseData';

export const Users: React.FC = () => {
  const { users, loading } = useUsers();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { hasRole } = useAuth();

  // Only super admins can access this page
  if (!hasRole(['super_admin'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'support_tech': return 'info';
      case 'sales_marketing': return 'success';
      case 'accounting': return 'default';
      case 'logistics': return 'default';
      default: return 'default';
    }
  };

  const roleStats = {
    super_admin: users.filter(u => u.role === 'super_admin').length,
    admin: users.filter(u => u.role === 'admin').length,
    support_tech: users.filter(u => u.role === 'support_tech').length,
    sales_marketing: users.filter(u => u.role === 'sales_marketing').length,
    accounting: users.filter(u => u.role === 'accounting').length,
    logistics: users.filter(u => u.role === 'logistics').length,
    other: users.filter(u => !['super_admin', 'admin', 'support_tech', 'sales_marketing', 'accounting', 'logistics'].includes(u.role)).length
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for users:`, selectedUsers);
    // Implement bulk actions here
    setSelectedUsers([]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Link to="/users/add">
          <Button className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </Link>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{roleStats.super_admin}</div>
            <div className="text-xs sm:text-sm text-gray-600">Super Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{roleStats.admin}</div>
            <div className="text-xs sm:text-sm text-gray-600">City Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{roleStats.support_tech}</div>
            <div className="text-xs sm:text-sm text-gray-600">Support Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{roleStats.sales_marketing}</div>
            <div className="text-xs sm:text-sm text-gray-600">Sales & Marketing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{roleStats.accounting}</div>
            <div className="text-xs sm:text-sm text-gray-600">Accounting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{roleStats.logistics}</div>
            <div className="text-xs sm:text-sm text-gray-600">Logistics</div>
          </CardContent>
        </Card>
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
                  placeholder="Search users by name, email, or phone..."
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
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">City Admin</option>
              <option value="support_tech">Support Tech</option>
              <option value="sales_marketing">Sales & Marketing</option>
              <option value="accounting">Accounting</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {['all', 'super_admin', 'admin', 'support_tech', 'sales_marketing', 'accounting', 'logistics'].map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors duration-200 ${
              filter === role
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {role === 'all' ? 'All Users' : role.replace('_', ' ')}
            <span className="ml-1 sm:ml-2 text-xs">
              {role === 'all' ? users.length : users.filter(u => u.role === role).length}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                  <Mail className="h-4 w-4 mr-1" />
                  Send Email
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              System Users ({filteredUsers.length})
            </h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Advanced Filter</span>
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
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">City</TableHead>
                <TableHead className="hidden lg:table-cell">Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden xl:table-cell">Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center truncate">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="text-sm text-gray-500 md:hidden">
                          {user.city}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>
                      <span className="hidden sm:inline">{user.role.replace('_', ' ').toUpperCase()}</span>
                      <span className="sm:hidden">{user.role.split('_')[0].toUpperCase()}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.city || 'N/A'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {user.phone || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {user.last_login ? (
                      <div className="text-sm text-gray-900">
                        <div>{new Date(user.last_login).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.last_login).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
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
    </div>
  );
};