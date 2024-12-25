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
export interface EncryptedPasswordData {
  entries: {
    [id: string]: EncryptedData;
  };
  lastModified: number;
} 