import { ethers } from 'ethers';

/**
 * 固定的签名消息
 */
const SIGN_MESSAGE = 'KEYSAFE_AUTH_V1';

/**
 * 加密工具类
 */
export class CryptoUtils {
  private static readonly PBKDF2_ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 256;
  private static readonly SALT_LENGTH = 16;
  private static readonly IV_LENGTH = 12;
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * 生成随机ID
   */
  static generateId(): string {
    return ethers.utils.id(Date.now().toString() + Math.random().toString()).slice(2, 34);
  }

  /**
   * 从签名和主密码派生加密密钥
   */
  static async deriveKey(signature: string, masterPassword: string, address: string): Promise<CryptoKey> {
    // 组合密钥材料
    const material = signature + masterPassword;
    const encoder = new TextEncoder();
    
    // 导入密钥材料
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(material),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // 使用钱包地址作为 salt
    const salt = encoder.encode(address.toLowerCase());

    // 派生加密密钥
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 使用会话密钥加密数据
   */
  static async encryptWithKey(data: string, key: CryptoKey): Promise<string> {
    try {
      // 生成随机 IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // 加密数据
      const encoder = new TextEncoder();
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encoder.encode(data)
      );

      // 组合 IV 和加密数据
      const result = new Uint8Array(iv.length + encryptedData.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedData), iv.length);

      // 转换为 Base64 字符串
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('加密失败:', error);
      throw new Error('加密失败');
    }
  }

  /**
   * 使用会话密钥解密数据
   */
  static async decryptWithKey(encryptedData: string, key: CryptoKey): Promise<string> {
    try {
      // 解码 Base64 字符串
      const data = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // 提取 IV 和加密数据
      const iv = data.slice(0, this.IV_LENGTH);
      const ciphertext = data.slice(this.IV_LENGTH);

      // 解密数据
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        ciphertext
      );

      // 转换为字符串
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('解密失败');
    }
  }

  /**
   * 获取签名消息
   */
  static getSignMessage(): string {
    return SIGN_MESSAGE;
  }
} 