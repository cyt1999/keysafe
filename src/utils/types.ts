/**
 * 密码条目
 */
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
}

/**
 * 加密数据
 */
export interface EncryptedData {
  iv: string;
  data: string;
  authTag: string;
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