export interface User {
  address: string;        // 钱包地址
  avatar: string;         // 头像URL
  nickname: string;       // 昵称
  hasSetupPassword: boolean; // 是否已设置主密码
  passwordSalt?: string;  // 密码盐值
  passwordVerification?: string; // 密码验证数据
}

export interface UserManagerState {
  currentUser: User | null;
  isAuthenticated: boolean;
} 