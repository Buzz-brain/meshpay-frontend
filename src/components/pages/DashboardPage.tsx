import React, { useState, useEffect } from 'react';
import { Send, Receipt, History, LogOut, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { apiService } from '../../services/api';
import { authUtils, formatCurrency } from '../../utils/auth';
import { User } from '../../types';

import { PageType } from '../../types';

interface DashboardPageProps {
  onNavigate: (page: PageType) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    const currentUser = authUtils.getUser();
    if (!currentUser) {
      onNavigate('welcome');
      return;
    }
    setUser(currentUser);
    fetchBalance(currentUser.accountNumber);
  }, []);

  const fetchBalance = async (accountNumber: string) => {
    try {
      const response = await apiService.getBalance(accountNumber);
      if (response.success && response.data) {
        setBalance(response.data.balance);
        setConnected(true);
      } else {
        setAlert({ type: 'error', message: 'Failed to fetch balance' });
        setConnected(false);
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error' });
      setConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchBalance(user.accountNumber);
  };

  const handleLogout = () => {
    authUtils.clearUser();
    onNavigate('welcome');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600">{user.fullname}</p>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}
      </div>

      {/* Balance Card */}
      <div className="px-6 mb-6">
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatCurrency(balance)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-blue-100 text-sm">
            <span>Account: {user.accountNumber}</span>
            <span>{user.phone}</span>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 text-center" onClick={() => onNavigate('send-money')}>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Send Money</h3>
            <p className="text-gray-600 text-sm">Transfer to anyone</p>
          </Card>

          <Card className="p-6 text-center" onClick={() => onNavigate('transactions')}>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <History className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">History</h3>
            <p className="text-gray-600 text-sm">View transactions</p>
          </Card>
        </div>
      </div>

      {/* Admin Access */}
      {authUtils.isAdmin() && (
        <div className="px-6 mb-6">
          <Card className="p-4 bg-orange-50 border-orange-200" onClick={() => onNavigate('admin')}>
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-orange-900">Admin Panel</h3>
                <p className="text-orange-700 text-sm">Manage users and system</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="px-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <Card className="p-6 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No recent transactions</p>
          <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
        </Card>
      </div>
    </div>
  );
};