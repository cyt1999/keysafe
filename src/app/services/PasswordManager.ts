import { PasswordEntry } from '../types/password';
import { CryptoUtils } from '../utils/crypto';
import { StorageUtils } from '../utils/storage';
import { SessionManager } from './SessionManager';
import { ethers } from 'ethers';

/**
 * 密码管理器服务类
 */
export class PasswordManagerService {
  private readonly sessionManager: SessionManager;

  constructor(config?: { sessionDuration?: number; inactiveTimeout?: number }) {
    this.sessionManager = SessionManager.getInstance({
      sessionDuration: config?.sessionDuration,
      inactiveTimeout: config?.inactiveTimeout
    });
  }

  /**
   * 解锁密码管理器
   */
  async unlock(signer: ethers.Signer, masterPassword: string): Promise<void> {
    try {
      // 获取钱包地址
      const address = await signer.getAddress();
      
      // 签名固定消息
      const signature = await signer.signMessage(CryptoUtils.getSignMessage());

      // 验证主密码
      const isFirstTimeUse = StorageUtils.isFirstTimeUse();
      if (!isFirstTimeUse) {
        const isValid = await StorageUtils.verifyMasterPassword(signature, masterPassword);
        if (!isValid) {
          throw new Error('主密码错误，请重试');
        }
      } else {
        // 首次使用，保存主密码哈希
        try {
          await StorageUtils.saveMasterPasswordHash(signature, masterPassword);
        } catch (error) {
          throw new Error('创建主密码失败，请重试');
        }
      }
      
      // 创建会话
      try {
        await this.sessionManager.createSession(signature, masterPassword, address);
      } catch (error) {
        if (isFirstTimeUse) {
          // 如果是首次使用且创建会话失败，清除已保存的主密码哈希
          await StorageUtils.clearPasswords();
        }
        throw new Error('创建会话失败，请重试');
      }
    } catch (error) {
      console.error('解锁失败:', error);
      throw error;
    }
  }

  /**
   * 锁定密码管理器
   */
  lock(): void {
    this.sessionManager.clearSession();
  }

  /**
   * 检查是否已锁定
   */
  isLocked(): boolean {
    return !this.sessionManager.isSessionValid();
  }

  /**
   * 添加新密码
   */
  async addPassword(entry: Omit<PasswordEntry, 'id'>): Promise<void> {
    if (this.isLocked()) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const key = this.sessionManager.getSessionKey();
      if (!key) {
        throw new Error('会话密钥无效');
      }

      const id = CryptoUtils.generateId();
      
      // 加密密码
      const encryptedPassword = await CryptoUtils.encryptWithKey(
        entry.password,
        key
      );

      // 创建新的密码条目
      const newEntry: PasswordEntry = {
        ...entry,
        id,
        password: encryptedPassword
      };

      // 获取现有密码列表并保存
      const passwords = await StorageUtils.getPasswords();
      await StorageUtils.savePasswords([...passwords, newEntry]);
    } catch (error) {
      console.error('添加密码失败:', error);
      throw error;
    }
  }

  /**
   * 获取密码列表
   */
  async getPasswords(): Promise<PasswordEntry[]> {
    if (this.isLocked()) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const key = this.sessionManager.getSessionKey();
      if (!key) {
        throw new Error('会话密钥无效');
      }

      const passwords = await StorageUtils.getPasswords();
      
      // 解密所有密码
      return await Promise.all(
        passwords.map(async (entry) => ({
          ...entry,
          password: await CryptoUtils.decryptWithKey(entry.password, key)
        }))
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
    if (this.isLocked()) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const key = this.sessionManager.getSessionKey();
      if (!key) {
        throw new Error('会话密钥无效');
      }

      const passwords = await StorageUtils.getPasswords();
      const index = passwords.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw new Error('密码不存在');
      }

      // 如果更新包含密码字段，需要重新加密
      let updatedPassword = updates.password;
      if (updatedPassword) {
        updatedPassword = await CryptoUtils.encryptWithKey(updatedPassword, key);
      }

      // 更新密码条目
      passwords[index] = {
        ...passwords[index],
        ...updates,
        password: updatedPassword || passwords[index].password
      };

      await StorageUtils.savePasswords(passwords);
    } catch (error) {
      console.error('更新密码失败:', error);
      throw error;
    }
  }

  /**
   * 删除密码
   */
  async deletePassword(id: string): Promise<void> {
    if (this.isLocked()) {
      throw new Error('密码管理器已锁定');
    }

    try {
      const passwords = await StorageUtils.getPasswords();
      const filteredPasswords = passwords.filter(p => p.id !== id);
      
      await StorageUtils.savePasswords(filteredPasswords);
    } catch (error) {
      console.error('删除密码失败:', error);
      throw new Error('删除密码失败');
    }
  }
} 