import React, { useState } from 'react';
import { User, Mail, Lock, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { apiService } from '../../services/api';
import { authUtils, validateEmail, validatePhone } from '../../utils/auth';
import { RegisterRequest } from '../../types';

import { PageType } from '../../types';

interface RegisterPageProps {
  onNavigate: (page: PageType) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    fullname: '',
    email: '',
    password: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterRequest>>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must be 11 digits starting with 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);

    try {
      const response = await apiService.register(formData);
      
      if (response.success && response.data) {
        authUtils.setUser(response.data);
        setAlert({ type: 'success', message: 'Account created successfully! Redirecting...' });
        
        setTimeout(() => {
          onNavigate('dashboard');
        }, 1500);
      } else {
        setAlert({ type: 'error', message: response.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <div className="p-4">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join the MeshPay network today</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullname}
              onChange={handleInputChange('fullname')}
              error={errors.fullname}
              icon={<User className="w-5 h-5" />}
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
            />

            <Input
              type="tel"
              label="Phone Number"
              placeholder="e.g., 09012345678"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              error={errors.phone}
              icon={<Phone className="w-5 h-5" />}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};