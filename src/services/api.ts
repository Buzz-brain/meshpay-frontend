import { LoginRequest, RegisterRequest, TransferRequest, ApiResponse, User } from '../types';

const BASE_URL = 'https://meshpay-backend.onrender.com/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred',
          data: data
        };
      }

      return {
        success: true,
        message: data.message || 'Success',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async transfer(transferData: TransferRequest): Promise<ApiResponse> {
    return this.request('/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async getBalance(accountNumber: string): Promise<ApiResponse<{ balance: number }>> {
    return this.request<{ balance: number }>(`/balance?account=${accountNumber}`);
  }

  async verifyName(accountNumber: string): Promise<ApiResponse<{ fullname: string }>> {
    return this.request<{ fullname: string }>(`/verify-name?account=${accountNumber}`);
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }
}

export const apiService = new ApiService();