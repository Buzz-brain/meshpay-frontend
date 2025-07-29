import { useState, useEffect } from 'react';
import { WelcomePage } from './components/pages/WelcomePage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { SendMoneyPage } from './components/pages/SendMoneyPage';
import { TransactionHistoryPage } from './components/pages/TransactionHistoryPage';
import { AdminPage } from './components/pages/AdminPage';
import { AdminDashboardPage } from './components/pages/AdminDashboardPage';
import { authUtils } from './utils/auth';
import { PageType } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('welcome');

  useEffect(() => {
    // Check if user is already authenticated
    if (authUtils.isAuthenticated()) {
      setCurrentPage('dashboard');
    }
  }, []);

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'send-money':
        return <SendMoneyPage onNavigate={handleNavigate} />;
      case 'transactions':
        return <TransactionHistoryPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      default:
        return <WelcomePage onNavigate={handleNavigate} />;
    }
  };

  return <div className="App">{renderPage()}</div>;
}

export default App;