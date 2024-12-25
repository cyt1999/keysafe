import { SessionData } from './types';

export class SessionUtils {
  private static readonly SESSION_KEY = 'keysafe_session';

  /**
   * 创建新会话
   */
  static async createSession(address: string, dataKey: CryptoKey): Promise<void> {
    try {
      const sessionData: SessionData = {
        address: address.toLowerCase(),
        dataKey
      };

      // 导出密钥为原始字节数组
      const exportedKey = await crypto.subtle.exportKey('raw', dataKey);
      const keyArray = Array.from(new Uint8Array(exportedKey));

      // 存储会话数据
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
        address: sessionData.address,
        dataKey: keyArray
      }));
    } catch (error) {
      console.error('创建会话失败:', error);
      throw new Error('创建会话失败');
    }
  }

  /**
   * 获取当前会话
   */
  static async getSession(): Promise<SessionData | null> {
    const data = sessionStorage.getItem(this.SESSION_KEY);
    if (!data) return null;

    try {
      const { address, dataKey } = JSON.parse(data);
      
      // 将数组转换回 Uint8Array
      const keyData = new Uint8Array(dataKey);
      
      // 导入密钥
      const importedKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      return {
        address,
        dataKey: importedKey
      };
    } catch (error) {
      console.error('解析会话数据失败:', error);
      return null;
    }
  }

  /**
   * 检查会话是否有效
   */
  static async isValidSession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session !== null;
    } catch (error) {
      console.error('检查会话状态失败:', error);
      return false;
    }
  }

  /**
   * 清除会话
   */
  static clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }
} 