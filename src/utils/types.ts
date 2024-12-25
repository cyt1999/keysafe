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
  randomIV: string;  // 随机值，确保相同数据加密结果不同
}

/**
 * 加密数据
 */
export interface EncryptedData {
  ciphertext: string;  // base64 encoded encrypted data
  iv: string;         // base64 encoded initialization vector
  tag: string;        // base64 encoded authentication tag
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