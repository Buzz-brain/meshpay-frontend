import React from 'react';
import { Smartphone, Wifi, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

import { PageType } from "../../types";

interface WelcomePageProps {
  onNavigate: (page: PageType) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
            <Smartphone className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MeshPay</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Your offline-first payment solution. Send and receive money even without internet.
          </p>
        </div>

        <Card className="w-full max-w-md p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <Wifi className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-600 font-medium">Mesh Network Detected</span>
          </div>
          <p className="text-gray-600 text-center text-sm">
            You're connected to a MeshPay node. Ready for secure transactions.
          </p>
        </Card>

        <div className="w-full max-w-md space-y-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => onNavigate('login')}
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <p className="text-center text-gray-600 text-sm">
            New to MeshPay?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Create Account
            </button>
          </p>
          <p className="text-center text-gray-600 text-sm">
            <button
              onClick={() => onNavigate('admin')}
              className="text-green-600 font-medium hover:text-blue-700 transition-colors"
            >
              Go to Admin Panel
            </button>
          </p>
          
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-gray-500">
          Powered by mesh networking technology
        </p>
      </div>
    </div>
  );
};