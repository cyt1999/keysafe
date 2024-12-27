import { ApiResponse } from '@/types/api';
import { CreatePasswordParams, Password, UpdatePasswordParams } from '@/types/password';

export class PasswordService {
  private static instance: PasswordService;
  private baseUrl: string = '/api/passwords';

  private constructor() {}

  public static getInstance(): PasswordService {
    if (!PasswordService.instance) {
      PasswordService.instance = new PasswordService();
    }
    return PasswordService.instance;
  }

  async listPasswords(): Promise<ApiResponse<Password[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error: any) {
      return {
        error: error.message || 'Unknown error occurred',
        status: 500,
      };
    }
  }

  async createPassword(params: CreatePasswordParams): Promise<ApiResponse<Password>> {
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

  async updatePassword(params: UpdatePasswordParams): Promise<ApiResponse<Password>> {
    try {
      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
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

  async deletePassword(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
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