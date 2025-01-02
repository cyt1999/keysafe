import { CryptoUtils } from '@/utils/crypto';
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
      
      // 创建会话
      try {
        await this.sessionManager.createSession(signature, masterPassword, address);
      } catch (error) {
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
   * 获取会话密钥
   */
  getSessionKey(): CryptoKey | null {
    if (this.isLocked()) {
      return null;
    }
    return this.sessionManager.getSessionKey();
  }
} 