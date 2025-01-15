export class SessionUtils {
  private static readonly ADDRESS_KEY = 'keysafe_session_address';
  private static readonly DATA_KEY_KEY = 'keysafe_session_data_key';

  /**
   * 存储钱包地址
   */
  static setWalletAddress(address: string): void {
    sessionStorage.setItem(this.ADDRESS_KEY, address.toLowerCase());
  }

  /**
   * 获取钱包地址
   */
  static getWalletAddress(): string | null {
    return sessionStorage.getItem(this.ADDRESS_KEY);
  }

  /**
   * 清除钱包地址
   */
  static clearWalletAddress(): void {
    sessionStorage.removeItem(this.ADDRESS_KEY);
  }

  /**
   * 存储数据加密密钥
   */
  static async setDataKey(dataKey: CryptoKey): Promise<void> {
    try {
      // 导出密钥为原始字节数组
      const exportedKey = await crypto.subtle.exportKey('raw', dataKey);
      const keyArray = Array.from(new Uint8Array(exportedKey));

      // 存储加密密钥
      sessionStorage.setItem(this.DATA_KEY_KEY, JSON.stringify(keyArray));
    } catch (error) {
      console.error('存储数据加密密钥失败:', error);
      throw new Error('存储数据加密密钥失败');
    }
  }

  /**
   * 获取数据加密密钥
   */
  static async getDataKey(): Promise<CryptoKey | null> {
    const data = sessionStorage.getItem(this.DATA_KEY_KEY);
    if (!data) return null;

    try {
      const keyArray = JSON.parse(data);
      // 将数组转换回 Uint8Array
      const keyData = new Uint8Array(keyArray);
      
      // 导入密钥
      return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('获取数据加密密钥失败:', error);
      return null;
    }
  }

  /**
   * 清除数据加密密钥（锁定功能）
   */
  static clearDataKey(): void {
    sessionStorage.removeItem(this.DATA_KEY_KEY);
  }

  /**
   * 检查是否已连接钱包（只检查地址）
   */
  static isWalletConnected(): boolean {
    return this.getWalletAddress() !== null;
  }

  /**
   * 检查是否已解锁（检查加密密钥）
   */
  static async isUnlocked(): Promise<boolean> {
    try {
      const dataKey = await this.getDataKey();
      return dataKey !== null;
    } catch (error) {
      console.error('检查解锁状态失败:', error);
      return false;
    }
  }
} 