export interface User {
  id: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface CreateUserParams {
  address: string;
  signature: string;
}

export interface VerifyUserParams {
  address: string;
  signature: string;
} 