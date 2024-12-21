const SESSION_KEY = 'keysafe_session';

interface SessionData {
  address: string;
  expiresAt: number;
}

export class SessionUtils {
  private static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24小时

  /**
   * 创建会话
   */
  static createSession(address: string): void {
    const sessionData: SessionData = {
      address: address.toLowerCase(),
      expiresAt: Date.now() + this.SESSION_DURATION
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
   * 清除会话
   */
  static clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
} 