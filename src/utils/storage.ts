import { MasterKeyData } from './passwordUtils';

export class StorageUtils {
  private static readonly STORAGE_KEY = 'keysafe_user_data';

  /**
   * 保存用户验证数据到本地存储
   */
  static saveUserData(address: string, data: MasterKeyData): void {
    const existingData = this.getAllUserData();
    existingData[address.toLowerCase()] = data;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
  }

  /**
   * 获取指定用户的验证数据
   */
  static getUserData(address: string): MasterKeyData | null {
    const data = this.getAllUserData();
    return data[address.toLowerCase()] || null;
  }

  /**
   * 检查用户是否存在
   */
  static userExists(address: string): boolean {
    return !!this.getUserData(address);
  }

  /**
   * 获取所有用户数据
   */
  private static getAllUserData(): Record<string, MasterKeyData> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * 清除用户数据
   */
  static clearUserData(address: string): void {
    const existingData = this.getAllUserData();
    delete existingData[address.toLowerCase()];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
  }
} 