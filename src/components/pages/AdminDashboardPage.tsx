import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/auth';
import { User } from '../../types';

import { PageType } from '../../types';

interface AdminDashboardPageProps {
  onNavigate: (page: PageType) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.accountNumber.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      if (response.success && response.data) {
        let usersArray: User[] = [];
        if (Array.isArray(response.data)) {
          usersArray = response.data;
        } else if (response.data && Array.isArray((response.data as any).users)) {
          usersArray = (response.data as any).users;
        }
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } else {
        setAlert({ type: 'error', message: 'Failed to fetch users' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchUsers();
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const totalBalance = safeUsers.reduce((sum, user) => sum + (user.balance || 0), 0);

  const safeFilteredUsers = Array.isArray(filteredUsers) ? filteredUsers : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="p-4">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Overview of all MeshPay users</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
              <p className="text-gray-600 text-sm">Total Balance</p>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-2xl font-bold text-green-600">Active</p>
              <p className="text-gray-600 text-sm">System Status</p>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search users by name, email, phone, or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Loading users...</p>
            </Card>
          ) : safeFilteredUsers.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No users match your search criteria' : 'No users registered yet'}
              </p>
            </Card>
          ) : (
            safeFilteredUsers.map((user, idx) => (
              <Card key={user.id || idx} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-lg">
                        {user.fullname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.fullname}</h3>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-sm">{user.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(user.balance || 0)}
                    </p>
                    <p className="text-gray-500 text-sm">Account: {user.accountNumber}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};