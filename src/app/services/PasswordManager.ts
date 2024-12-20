import { PasswordEntry } from '../types/password';
import { CryptoUtils } from '../utils/crypto';
import { ethers } from 'ethers';
import { UserManager } from './UserManager';

/**
 * 密码管理器服务类
 */
export class PasswordManagerService {
  private sessionKey: CryptoKey | null = null;
  private readonly storageKey: string = 'keysafe_passwords';
  private readonly userManager: UserManager;
  private locked: boolean = true;

  constructor() {
    // 初始化 userManager，确保只在客户端环境下访问
    this.userManager = typeof window !== 'undefined' 
      ? UserManager.getInstance()
      : null as unknown as UserManager;
  }

  /**
   * 解锁密码管理器
   */
  async unlock(signer: ethers.Signer, masterPassword: string): Promise<void> {
    try {
      console.log('PasswordManager: 开始解锁流程...');
      // 获取钱包地址
      const address = await signer.getAddress();
      
      // 验证主密码
      console.log('PasswordManager: 验证主密码...');
      const isValid = this.userManager.verifyPassword(address, masterPassword);
      if (!isValid) {
        throw new Error('密码错误');
      }
      console.log('PasswordManager: 主密码验证成功');

      // 使用主密码派生会话密钥
      console.log('PasswordManager: 派生会话密钥...');
      const salt = Buffer.from(address.toLowerCase().slice(2), 'hex');
      const key = CryptoUtils.deriveKey(masterPassword, salt);
      
      // 创建 CryptoKey
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        key,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      const sessionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('session'),
          iterations: 1,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      this.sessionKey = sessionKey;
      this.locked = false;
      console.log('PasswordManager: 解锁成功');
    } catch (error) {
      console.error('PasswordManager: 解锁失败:', error);
      this.sessionKey = null;
      this.locked = true;
      throw error;
    }
  }

  /**
   * 锁定密码管理器
   */
  lock(): void {
    console.log('PasswordManager: 锁定密码管理器');
    this.sessionKey = null;
    this.locked = true;
  }

  /**
   * 检查是否已锁定
   */
  isLocked(): boolean {
    return this.locked;
  }

  /**
   * 添加新密码
   */
  async addPassword(entry: Omit<PasswordEntry, 'id'>): Promise<void> {
    if (this.locked || !this.sessionKey) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const id = CryptoUtils.generateId();
      
      // 加密密码
      const encoder = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedPassword = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        this.sessionKey,
        encoder.encode(entry.password)
      );

      // 组合 IV 和加密数据
      const encryptedData = new Uint8Array(iv.length + encryptedPassword.byteLength);
      encryptedData.set(iv);
      encryptedData.set(new Uint8Array(encryptedPassword), iv.length);

      // 创建新的密码条目
      const newEntry: PasswordEntry = {
        ...entry,
        id,
        password: btoa(String.fromCharCode(...encryptedData))
      };

      // 获取现有密码列表并保存
      const passwords = this.getStoredPasswords();
      this.savePasswords([...passwords, newEntry]);
    } catch (error) {
      console.error('添加密码失败:', error);
      throw error;
    }
  }

  /**
   * 获取密码列表
   */
  async getPasswords(): Promise<PasswordEntry[]> {
    if (this.locked || !this.sessionKey) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const passwords = this.getStoredPasswords();
      
      // 解密所有密码
      return await Promise.all(
        passwords.map(async (entry) => {
          const encryptedData = new Uint8Array(
            atob(entry.password)
              .split('')
              .map(char => char.charCodeAt(0))
          );

          // 提取 IV 和加密数据
          const iv = encryptedData.slice(0, 12);
          const ciphertext = encryptedData.slice(12);

          // 解密密码
          const decryptedPassword = await crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv
            },
            this.sessionKey!,
            ciphertext
          );

          return {
            ...entry,
            password: new TextDecoder().decode(decryptedPassword)
          };
        })
      );
    } catch (error) {
      console.error('获取密码失败:', error);
      throw error;
    }
  }

  /**
   * 更新密码
   */
  async updatePassword(
    id: string,
    updates: Partial<Omit<PasswordEntry, 'id'>>
  ): Promise<void> {
    if (this.locked || !this.sessionKey) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const passwords = this.getStoredPasswords();
      const index = passwords.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw new Error('密码不存在');
      }

      // 如果更新包含密码字段，需要重新加密
      let updatedPassword = updates.password;
      if (updatedPassword) {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedPassword = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv
          },
          this.sessionKey,
          encoder.encode(updatedPassword)
        );

        // 组合 IV 和加密数据
        const encryptedData = new Uint8Array(iv.length + encryptedPassword.byteLength);
        encryptedData.set(iv);
        encryptedData.set(new Uint8Array(encryptedPassword), iv.length);
        
        updatedPassword = btoa(String.fromCharCode(...encryptedData));
      }

      // 更新密码条目
      passwords[index] = {
        ...passwords[index],
        ...updates,
        password: updatedPassword || passwords[index].password
      };

      this.savePasswords(passwords);
    } catch (error) {
      console.error('更新密码失败:', error);
      throw error;
    }
  }

  /**
   * 删除密码
   */
  async deletePassword(id: string): Promise<void> {
    if (this.locked || !this.sessionKey) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const passwords = this.getStoredPasswords();
      const filteredPasswords = passwords.filter(p => p.id !== id);
      
      this.savePasswords(filteredPasswords);
    } catch (error) {
      console.error('删除密码失败:', error);
      throw new Error('删除密码失败');
    }
  }

  private getStoredPasswords(): PasswordEntry[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const passwordsJson = localStorage.getItem(this.storageKey);
    return passwordsJson ? JSON.parse(passwordsJson) : [];
  }

  private savePasswords(passwords: PasswordEntry[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(passwords));
  }
} 