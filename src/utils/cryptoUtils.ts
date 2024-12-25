import { Buffer } from 'buffer';
import { EncryptedData } from './types';

export class CryptoUtils {
  private static readonly SALT_LENGTH = 32;
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 32;

  /**
   * 从主密码生成主密钥
   */
  static async generateMasterKey(password: string, salt?: Uint8Array): Promise<{
    masterKey: CryptoKey;
    salt: Uint8Array;
  }> {
    // 如果没有提供盐值，生成随机盐值
    const useSalt = salt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    
    // 从密码派生主密钥
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const masterKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: useSalt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    return { masterKey, salt: useSalt };
  }

  /**
   * 从主密钥和签名生成数据加密密钥
   */
  static async deriveDataKey(masterKey: CryptoKey, signature: string): Promise<CryptoKey> {
    // 导出主密钥的原始字节
    const masterKeyBytes = await crypto.subtle.exportKey('raw', masterKey);
    
    // 结合主密钥和签名
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      Buffer.concat([
        new Uint8Array(masterKeyBytes),
        new TextEncoder().encode(signature)
      ]),
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    // 使用 HKDF 派生数据加密密钥
    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(0),
        info: new TextEncoder().encode('data encryption'),
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 生成验证数据
   */
  static async generateVerificationData(masterKey: CryptoKey): Promise<EncryptedData> {
    // 生成随机验证字符串
    const verificationString = crypto.randomUUID();
    
    // 加密验证字符串
    return this.encrypt(verificationString, masterKey);
  }

  /**
   * 验证主密码
   */
  static async verifyPassword(
    password: string,
    salt: Uint8Array,
    encryptedVerification: EncryptedData,
  ): Promise<CryptoKey> {
    try {
      // 使用相同的盐值重新生成主密钥
      const { masterKey } = await this.generateMasterKey(password, salt);
      
      // 尝试解密验证字符串
      // 如果密码错误，解密会失败并抛出异常
      await this.decrypt(encryptedVerification, masterKey);
      
      // 如果能成功解密，说明密码正确
      return masterKey;
    } catch {
      throw new Error('密码错误');
    }
  }

  /**
   * 加密数据
   */
  static async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encodedData
    );

    return {
      ciphertext: Buffer.from(encryptedData).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      tag: '' // AES-GCM 的认证标签包含在 ciphertext 中
    };
  }

  /**
   * 解密数据
   */
  static async decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedData);
  }

  /**
   * 计算主密钥的哈希值
   */
  static async generateMasterKeyHash(masterKey: CryptoKey): Promise<string> {
    // 导出主密钥的原始字节
    const keyBytes = await crypto.subtle.exportKey('raw', masterKey);
    
    // 计算哈希值
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
    
    // 转换为 base64 字符串
    return Buffer.from(hashBuffer).toString('base64');
  }
} 