import { User } from '../types';

const USER_KEY = 'meshpay_user';
const SESSION_KEY = 'meshpay_session';

export const authUtils = {
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_KEY, new Date().toISOString());
  },

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  clearUser(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.email && user.email.includes('admin') || false;
  }
};

export const validatePhone = (phone: string): boolean => {
  return /^0\d{10}$/.test(phone);
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

export const formatAccountNumber = (phone: string): string => {
  return phone.startsWith('0') ? phone.substring(1) : phone;
};