export interface User {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  accountNumber: string;
  amount: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  phone: string;
}

export interface TransferRequest {
  from: string;
  to: string;
  amount: number | string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Transaction {
  id: string;
  _id?: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: "success" | "failed" | "pending";
  description?: string;
  senderName: string;
  receiverName: string;
}

export type PageType = 'welcome' | 'login' | 'register' | 'dashboard' | 'send-money' | 'transactions' | 'admin' | 'admin-dashboard';