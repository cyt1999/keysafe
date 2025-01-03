export interface Password {
  id: string;
  userId: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordState {
  passwords: Password[];
  loading: boolean;
  error: string | null;
}

export interface CreatePasswordParams {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface UpdatePasswordParams extends Partial<CreatePasswordParams> {
  id: string;
}

// 密码条目的接口定义
export interface PasswordEntry {
  id?: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
} 