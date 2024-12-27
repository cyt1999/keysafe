import { CreateUserParams, User, VerifyUserParams } from '@/types/auth';
import { ApiResponse } from '@/types/api';

export class AuthService {
  private static instance: AuthService;
  private baseUrl: string = '/api/auth';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async createUser(params: CreateUserParams): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (error: any) {
      return {
        error: error.message || 'Unknown error occurred',
        status: 500,
      };
    }
  }

  async verifyUser(params: VerifyUserParams): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (error: any) {
      return {
        error: error.message || 'Unknown error occurred',
        status: 500,
      };
    }
  }
} 