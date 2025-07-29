import { LoginRequest, RegisterRequest, TransferRequest, ApiResponse, User } from '../types';

const BASE_URL = 'https://meshpay-backend.onrender.com/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "An error occurred",
          data: data,
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    return this.request<User>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async transfer(transferData: TransferRequest): Promise<ApiResponse> {
    console.log(transferData);
    return this.request("/transfer", {
      method: "POST",
      body: JSON.stringify(transferData),
    });
  }

  async getBalance(
    accountNumber: string
  ): Promise<ApiResponse<{ amount: number }>> {
    return this.request<{ amount: number }>(
      `/balance?account=${accountNumber}`
    );
  }

  async verifyName(
    accountNumber: string
  ): Promise<ApiResponse<{ fullname: string }>> {
    return this.request<{ fullname: string }>(
      `/verify-name?account=${accountNumber}`
    );
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/users");
  }

  async getNotifications(
    userId: string
  ): Promise<ApiResponse<{ notifications: any[] }>> {
    return this.request<{ notifications: any[] }>(
      `/notifications?userId=${userId}`
    );
  }

  async markNotificationsRead(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/notifications/mark-read`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async getTransactions(
    accountNumber: string
  ): Promise<ApiResponse<{ transactions: any[] }>> {
    return this.request<{ transactions: any[] }>(
      `/transactions?accountNumber=${accountNumber}`
    );
  }
}

export const apiService = new ApiService();