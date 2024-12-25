const SESSION_KEY = 'keysafe_session';

interface SessionData {
  address: string;
  encryptionKey: CryptoKey;
  timestamp: number;
}

export class SessionUtils {
  /**
   * 创建会话
   */
  static async createSession(address: string, encryptionKey: CryptoKey): Promise<void> {
    const sessionData: SessionData = {
      address: address.toLowerCase(),
      encryptionKey,
      timestamp: Date.now()
    };

    // 导出密钥
    const keyBuffer = await crypto.subtle.exportKey('raw', encryptionKey);
    
    // 保存会话数据
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      address: sessionData.address,
      encryptionKey: Buffer.from(keyBuffer).toString('base64'),
      timestamp: sessionData.timestamp
    }));
  }

  /**
   * 获取会话数据
   */
  static async getSession(): Promise<SessionData | null> {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      const keyBuffer = Buffer.from(parsed.encryptionKey, 'base64');
      
      // 从导出的密钥数据重新创建 CryptoKey 对象
      const encryptionKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
      );

      return {
        address: parsed.address,
        encryptionKey,
        timestamp: parsed.timestamp
      };
    } catch {
      return null;
    }
  }

  /**
   * 检查会话是否有效
   */
  static async isValidSession(address: string): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;

    const isValid = 
      session.address === address.toLowerCase() &&
      Date.now() - session.timestamp < 24 * 60 * 60 * 1000; // 24小时有效期

    if (!isValid) {
      this.clearSession();
    }

    return isValid;
  }

  /**
   * 清除会话
   */
  static clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
} 