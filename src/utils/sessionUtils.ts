const SESSION_KEY = 'keysafe_session';

interface SessionData {
  address: string;
  expiresAt: number;
  masterKey: string; // 使用字符串存储Buffer
}

export class SessionUtils {
  private static SESSION_DURATION = process.env.SESSION_DURATION ? parseInt(process.env.SESSION_DURATION) : 24 * 60 * 60 * 1000; // 默认24小时

  /**
   * 创建会话
   */
  static createSession(address: string, masterKey: Buffer): void {
    const sessionData: SessionData = {
      address: address.toLowerCase(),
      expiresAt: Date.now() + this.SESSION_DURATION,
      masterKey: masterKey.toString('hex')
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }

  /**
   * 验证会话是否有效
   */
  static isValidSession(address: string): boolean {
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (!sessionData) return false;

      const data: SessionData = JSON.parse(sessionData);
      return (
        data.address === address.toLowerCase() &&
        data.expiresAt > Date.now()
      );
    } catch {
      return false;
    }
  }

  /**
   * 获取会话数据
   */
  static getSession(): { masterKey: Buffer } | null {
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const data: SessionData = JSON.parse(sessionData);
      if (!data.masterKey) return null;

      return {
        masterKey: Buffer.from(data.masterKey, 'hex')
      };
    } catch {
      return null;
    }
  }

  /**
   * 清除会话
   */
  static clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
} 