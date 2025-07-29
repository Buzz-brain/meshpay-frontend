import React, { useState } from 'react';
import { ArrowLeft, Search, Send, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { apiService } from '../../services/api';
import { authUtils, formatCurrency, formatAccountNumber } from '../../utils/auth';

import { PageType } from '../../types';

interface SendMoneyPageProps {
  onNavigate: (page: PageType) => void;
}

export const SendMoneyPage: React.FC<SendMoneyPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    description: ''
  });
  const [recipientName, setRecipientName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const user = authUtils.getUser();
  if (!user) {
    onNavigate('welcome');
    return null;
  }

  const verifyRecipient = async (account: string) => {
    if (account.length !== 10) return;
    
    setVerifying(true);
    try {
      const response = await apiService.verifyName(account);
      if (response.success && response.data) {
        setRecipientName(response.data.fullname);
      } else {
        setRecipientName('');
        setAlert({ type: 'error', message: 'Account not found' });
      }
    } catch (error) {
      setRecipientName('');
      setAlert({ type: 'error', message: 'Error verifying account' });
    } finally {
      setVerifying(false);
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, recipient: value }));
    
    if (value.length === 10) {
      verifyRecipient(value);
    } else {
      setRecipientName('');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setFormData(prev => ({ ...prev, amount: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.recipient || formData.recipient.length !== 10) {
      setAlert({ type: 'error', message: 'Please enter a valid 10-digit account number' });
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid amount' });
      return false;
    }

    if (!recipientName) {
      setAlert({ type: 'error', message: 'Please verify the recipient account' });
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep('confirm');
      setAlert(null);
    }
  };

  const handleSendMoney = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const transferData = {
        from: formatAccountNumber(user.phone),
        to: formData.recipient,
        amount: parseFloat(formData.amount)
      };

      const response = await apiService.transfer(transferData);
      
      if (response.success) {
        setStep('success');
      } else {
        setAlert({ type: 'error', message: response.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Transaction failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    onNavigate('dashboard');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h1>
          <p className="text-gray-600 mb-6">
            {formatCurrency(parseFloat(formData.amount))} has been sent to {recipientName}
          </p>
          <Button onClick={handleBackToDashboard} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="p-4">
        <button
          onClick={() => step === 'confirm' ? setStep('form') : onNavigate('dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Money</h1>
        <p className="text-gray-600 mb-8">Transfer money to another MeshPay user</p>

        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {step === 'form' && (
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Input
                  label="Recipient Account Number"
                  placeholder="Enter 10-digit account number"
                  value={formData.recipient}
                  onChange={handleRecipientChange}
                  maxLength={10}
                  icon={<Search className="w-5 h-5" />}
                />
                {verifying && (
                  <p className="text-sm text-blue-600 mt-2">Verifying account...</p>
                )}
                {recipientName && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {recipientName}
                  </p>
                )}
              </div>

              <Input
                label="Amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleAmountChange}
                type="number"
                step="0.01"
              />

              <Input
                label="Description (Optional)"
                placeholder="What's this for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />

              <Button
                onClick={handleContinue}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {step === 'confirm' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirm Transfer</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <div className="text-right">
                  <p className="font-semibold">{recipientName}</p>
                  <p className="text-sm text-gray-500">{formData.recipient}</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-xl">{formatCurrency(parseFloat(formData.amount))}</span>
              </div>
              
              {formData.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{formData.description}</span>
                </div>
              )}
              
              <hr className="my-4" />
              
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <div className="text-right">
                  <p className="font-semibold">{user.fullname}</p>
                  <p className="text-sm text-gray-500">{user.accountNumber}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSendMoney}
              loading={loading}
              className="w-full"
              size="lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Money
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};