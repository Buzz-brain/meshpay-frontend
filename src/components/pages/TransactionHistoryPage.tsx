import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Receipt } from "lucide-react";
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/auth';
import { Transaction, User } from '../../types';

import { PageType } from '../../types';
import { apiService } from '../../services/api';
import { authUtils } from '../../utils/auth';

interface TransactionHistoryPageProps {
  onNavigate: (page: PageType) => void;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user account number from auth
  const result = authUtils.getUser();
  const currentUser: User = (result as any)?.user || result;
  const userAccount = currentUser?.accountNumber || '';

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getTransactions(userAccount);
        if (response.success && response.data) {
          setTransactions(response.data.transactions);
        } else {
          setError(response.message || 'Failed to fetch transactions');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    if (userAccount) fetchTransactions();
  }, [userAccount]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction: Transaction, userAccount: string) => {
    const isSent = transaction.from === userAccount;
    return isSent ? Send : Receipt;
  };

  const getTransactionColor = (transaction: Transaction, userAccount: string) => {
    if (transaction.status === 'failed') return 'text-red-600';
    const isSent = transaction.from === userAccount;
    return isSent ? 'text-red-600' : 'text-green-600';
  };

  const getTransactionType = (transaction: Transaction, userAccount: string) => {
    const isSent = transaction.from === userAccount;
    return isSent ? 'Sent' : 'Received';
  };

  // userAccount is now from authUtils

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'sent') return transaction.from === userAccount;
    if (filter === 'received') return transaction.to === userAccount;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="p-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-gray-600 mb-6">Review your payment activity</p>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'sent' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('sent')}
          >
            Sent
          </Button>
          <Button
            variant={filter === 'received' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('received')}
          >
            Received
          </Button>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Loading transactions...</p>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </Card>
          ) : filteredTransactions.length === 0 ? (
            <Card className="p-8 text-center">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'You haven\'t made any transactions yet'
                  : `No ${filter} transactions found`
                }
              </p>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction, userAccount);
              const isSent = transaction.from === userAccount;
              return (
                <Card key={transaction._id || transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        transaction.status === 'failed' 
                          ? 'bg-red-100' 
                          : isSent 
                            ? 'bg-red-100' 
                            : 'bg-green-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${getTransactionColor(transaction, userAccount)}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getTransactionType(transaction, userAccount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isSent ? `To ${transaction.receiverName} ((${transaction.to})` : `From ${transaction.senderName} (${transaction.from})`}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.status === 'failed' 
                          ? 'text-gray-400' 
                          : getTransactionColor(transaction, userAccount)
                      }`}>
                        {isSent ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                      {transaction.status === 'failed' && (
                        <p className="text-xs text-red-600 font-medium">Failed</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};