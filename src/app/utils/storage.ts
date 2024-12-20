import { PasswordEntry } from '../types/password';

/**
 * 本地存储工具类
 * 处理密码数据的本地存储操作
 */
export class StorageUtils {
  private static readonly STORAGE_KEY = 'encrypted_passwords';
  private static readonly SESSION_KEY = 'password_manager_session';
  private static readonly MASTER_PASSWORD_HASH_KEY = 'master_password_hash';

  /**
   * 保存加密后的密码数据到本地存储
   * @param encryptedPasswords - 加密后的密码数据数组
   */
  static async savePasswords(encryptedPasswords: PasswordEntry[]): Promise<void> {
    try {
      const data = JSON.stringify(encryptedPasswords);
      localStorage.setItem(this.STORAGE_KEY, data);
    } catch (error) {
      console.error('保存密码失败:', error);
      throw new Error('保存密码时发生错误');
    }
  }

  /**
   * 从本地存储获取加密的密码数据
   * @returns 加密的密码数据数组
   */
  static async getPasswords(): Promise<PasswordEntry[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取密码失败:', error);
      throw new Error('获取密码时发生错误');
    }
  }

  /**
   * 清除本地存储的所有密码数据
   */
  static async clearPasswords(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.MASTER_PASSWORD_HASH_KEY);
    } catch (error) {
      console.error('清除密码失败:', error);
      throw new Error('清除密码时发生错误');
    }
  }

  /**
   * 保存会话信息到 sessionStorage
   * @param session - 会话信息
   */
  static saveSession(session: { expiresAt: number; lastActivityAt: number }): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('保存会话失败:', error);
      throw new Error('保存会话时发生错误');
    }
  }

  /**
   * 从 sessionStorage 获取会话信息
   * @returns 会话信息，如果不存在则返回 null
   */
  static getSession(): { expiresAt: number; lastActivityAt: number } | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取会话失败:', error);
      return null;
    }
  }

  /**
   * 清除会话信息
   */
  static clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('清除会话失败:', error);
    }
  }

  /**
   * 检查是否是首次使用（是否已设置主密码）
   */
  static isFirstTimeUse(): boolean {
    return !localStorage.getItem(this.MASTER_PASSWORD_HASH_KEY);
  }

  /**
   * 保存主密码的哈希值
   */
  static async saveMasterPasswordHash(signature: string, masterPassword: string): Promise<void> {
    try {
      // 使用签名和主密码生成哈希
      const encoder = new TextEncoder();
      const data = encoder.encode(signature + masterPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      localStorage.setItem(this.MASTER_PASSWORD_HASH_KEY, hashHex);
    } catch (error) {
      console.error('保存主密码哈希失败:', error);
      throw new Error('保存主密码哈希失败');
    }
  }

  /**
   * 验证主密码
   */
  static async verifyMasterPassword(signature: string, masterPassword: string): Promise<boolean> {
    try {
      const storedHash = localStorage.getItem(this.MASTER_PASSWORD_HASH_KEY);
      if (!storedHash) {
        return true; // 首次使用，直接返回true
      }

      // 计算当前输入的哈希
      const encoder = new TextEncoder();
      const data = encoder.encode(signature + masterPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return currentHash === storedHash;
    } catch (error) {
      console.error('验证主密码失败:', error);
      throw new Error('验证主密码失败');
    }
  }
} 