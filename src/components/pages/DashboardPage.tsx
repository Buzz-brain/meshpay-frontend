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
  // Icon and color helpers for transactions (copied from TransactionHistoryPage)
  const getTransactionIcon = (tx: any, accountNumber: string) => {
    const isSent = tx.from === accountNumber;
    return isSent ? Send : Receipt;
  };

  const getTransactionColor = (tx: any, accountNumber: string) => {
    if (tx.status === 'failed') return 'text-gray-400';
    const isSent = tx.from === accountNumber;
    return isSent ? 'text-red-600' : 'text-green-600';
  };
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    const result = authUtils.getUser();
    const currentUser = (result as any)?.user || result;
    if (!currentUser) {
      onNavigate('welcome');
      return;
    }
    setUser(currentUser);
    fetchBalance(currentUser.accountNumber);
    fetchRecentTransactions(currentUser.accountNumber);
  }, []);

  const fetchRecentTransactions = async (accountNumber: string) => {
    setLoadingTransactions(true);
    try {
      const response = await apiService.getTransactions(accountNumber);
      if (response.success && response.data) {
        // Show only the 3 most recent transactions
        setRecentTransactions(response.data.transactions.slice(0, 3));
      } else {
        setRecentTransactions([]);
      }
    } catch (err) {
      setRecentTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Poll notifications every 5 seconds
  useEffect(() => {
    if (!user) return;
    let interval: number;
    const pollNotifications = async () => {
      const response = await apiService.getNotifications(user.id);
      if (response.success && response.data) {
        // response.data is { notifications: [...] }
        const notificationsArr = Array.isArray(response.data.notifications)
          ? response.data.notifications
          : [];
        const unread = notificationsArr.filter((n: any) => !n.read);
        setNotifications(unread);
        setShowNotification(unread.length > 0);
      }
    };
    pollNotifications();
    interval = window.setInterval(pollNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchBalance = async (accountNumber: string) => {
    try {
      const response = await apiService.getBalance(accountNumber);
      if (response.success && response.data) {
        setBalance(response.data.amount);
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
      {/* Notification Popup */}
      {showNotification && notifications.length > 0 && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="bg-gradient-to-r from-blue-800 to-purple-800 text-white shadow-2xl rounded-xl p-5 mb-4 flex items-center justify-between border border-blue-700 animate-fade-in"
              style={{ boxShadow: '0 8px 32px rgba(60, 60, 180, 0.15)' }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2 flex items-center justify-center">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" fill="#fff" opacity="0.2"/>
                    <path d="M12 8v4l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-lg leading-tight">New Transaction</span>
                  <span className="block text-white/80 text-sm mt-1">{n.message}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition"
                onClick={async () => {
                  if (user) {
                    await apiService.markNotificationsRead(user.id);
                    await fetchBalance(user.accountNumber);
                    await fetchRecentTransactions(user.accountNumber);
                  }
                  setShowNotification(false);
                  setNotifications([]);
                }}
              >
                <span className="sr-only">Close</span>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M6 6l8 8M6 14L14 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}

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
        {loadingTransactions ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">Loading recent transactions...</p>
          </Card>
        ) : recentTransactions.length === 0 ? (
          <Card className="p-6 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No recent transactions</p>
            <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((tx) => {
              const isSent = tx.from === user?.accountNumber;
              const Icon = getTransactionIcon(tx, user?.accountNumber);
              return (
                <Card key={tx._id || tx.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        tx.status === 'failed'
                          ? 'bg-red-100'
                          : isSent
                            ? 'bg-red-100'
                            : 'bg-green-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${getTransactionColor(tx, user?.accountNumber)}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {isSent ? 'Sent' : 'Received'}{' '}
                          {isSent
                            ? `to ${tx.receiverName} (${tx.to})`
                            : `from ${tx.senderName} (${tx.from})`}
                        </p>
                        {tx.description && (
                          <p className="text-sm text-gray-500">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.status === 'failed'
                          ? 'text-gray-400'
                          : isSent
                            ? 'text-red-600'
                            : 'text-green-600'
                      }`}>
                        {isSent ? '-' : '+'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                      {tx.status === 'failed' && (
                        <p className="text-xs text-red-600 font-medium">Failed</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};