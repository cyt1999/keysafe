import { CryptoUtils } from '@/utils/crypto';

/**
 * 用户信息接口
 */
interface UserInfo {
  id: string;
  address: string;
  avatar?: string | null;
  nickname?: string | null;
}

/**
 * 会话信息接口
 */
interface SessionInfo {
  key: CryptoKey;
  createdAt: number;
  expiresAt: number;
  address: string;
}

/**
 * 会话管理器配置接口
 */
interface SessionManagerConfig {
  sessionDuration: number;    // 会话持续时间（毫秒）
  inactiveTimeout: number;    // 无操作超时时间（毫秒）
}

/**
 * 会话管理器类
 */
export class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionInfo | null = null;
  private readonly config: SessionManagerConfig;
  private readonly USER_INFO_KEY = 'keysafe_user_info';

  private constructor(config?: Partial<SessionManagerConfig>) {
    this.config = {
      sessionDuration: 12 * 60 * 60 * 1000,  // 12小时
      inactiveTimeout: 30 * 60 * 1000,      // 30分钟
      ...config
    };
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: Partial<SessionManagerConfig>): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(config);
    }
    return SessionManager.instance;
  }

  /**
   * 创建新会话
   */
  async createSession(signature: string, masterPassword: string, address: string): Promise<void> {
    try {
      // 从签名和主密码派生密钥
      const key = await CryptoUtils.deriveKey(signature, masterPassword, address);
      
      const now = Date.now();
      this.currentSession = {
        key,
        createdAt: now,
        expiresAt: now + this.config.sessionDuration,
        address
      };

      this.updateLastActivity();
    } catch (error) {
      console.error('创建会话失败:', error);
      throw new Error('创建会话失败');
    }
  }

  /**
   * 保存用户信息到本地存储
   */
  saveUserInfo(userInfo: UserInfo): void {
    try {
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }

  /**
   * 从本地存储获取用户信息
   */
  getUserInfo(): UserInfo | null {
    try {
      const data = localStorage.getItem(this.USER_INFO_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 更新用户信息
   */
  updateUserInfo(updates: Partial<UserInfo>): void {
    try {
      const currentInfo = this.getUserInfo();
      if (currentInfo) {
        this.saveUserInfo({ ...currentInfo, ...updates });
      } else if (updates.address) {
        this.saveUserInfo(updates as UserInfo);
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
    }
  }

  /**
   * 检查会话是否有效
   */
  isSessionValid(): boolean {
    if (!this.currentSession) {
      return false;
    }

    const now = Date.now();
    
    // 检查会话是否过期
    if (now >= this.currentSession.expiresAt) {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * 获取当前会话密钥
   */
  getSessionKey(): CryptoKey | null {
    return this.isSessionValid() ? this.currentSession!.key : null;
  }

  /**
   * 获取当前会话地址
   */
  getSessionAddress(): string | null {
    return this.isSessionValid() ? this.currentSession!.address : null;
  }

  /**
   * 更新最后活动时间
   */
  private updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.expiresAt = Date.now() + this.config.sessionDuration;
    }
  }

  /**
   * 清除会话和用户信息
   */
  clearSession(): void {
    this.currentSession = null;
    localStorage.removeItem(this.USER_INFO_KEY);
  }
} 