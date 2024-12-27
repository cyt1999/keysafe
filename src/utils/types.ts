/**
 * 密码条目
 */
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 密码条目的用户数据
 */
export interface PasswordData {
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
}

/**
 * 加密数据
 */
export interface EncryptedData {
  ciphertext: string;  // base64 编码的加密数据
  iv: string;         // base64 编码的初始化向量
  tag: string;        // AES-GCM 的认证标签（实际包含在 ciphertext 中）
}

/**
 * 加密后的密码数据
 */
export interface EncryptedPasswordEntry {
  id: string;
  encryptedData: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 会话数据
 */
export interface SessionData {
  address: string;
  dataKey: CryptoKey;
} 