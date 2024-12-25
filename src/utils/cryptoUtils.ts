import { Buffer } from 'buffer';
import { EncryptedData, PasswordData } from './types';

export class CryptoUtils {
  private static readonly SALT_LENGTH = 32;
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 32;

  /**
   * 从主密码生成主密钥和主密钥哈希
   */
  static async generateMasterKey(password: string): Promise<{
    masterKey: CryptoKey;
    masterKeyHash: string;
    salt: Uint8Array;
  }> {
    // 生成随机盐值
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    
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
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // 生成主密钥哈希
    const masterKeyHash = await this.generateMasterKeyHash(masterKey);

    return { masterKey, masterKeyHash, salt };
  }

  /**
   * 验证主密码
   */
  static async verifyMasterPassword(
    password: string,
    salt: Uint8Array,
    storedMasterKeyHash: string
  ): Promise<CryptoKey> {
    try {
      // 使用相同的盐值重新生成主密钥
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
          salt: salt,
          iterations: this.ITERATIONS,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // 生成主密钥哈希并比对
      const masterKeyHash = await this.generateMasterKeyHash(masterKey);
      
      if (masterKeyHash !== storedMasterKeyHash) {
        throw new Error('密码错误');
      }

      return masterKey;
    } catch (error) {
      console.error('验证主密码失败:', error);
      throw new Error('密码错误');
    }
  }

  /**
   * 生成主密钥的哈希值
   */
  private static async generateMasterKeyHash(masterKey: CryptoKey): Promise<string> {
    // 导出主密钥的原始字节
    const keyBytes = await crypto.subtle.exportKey('raw', masterKey);
    
    // 计算哈希值
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
    
    // 转换为 base64 字符串
    return Buffer.from(hashBuffer).toString('base64');
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
   * 加���数据
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
   * 加密密码条目
   * 将用户数据和随机值打包在一起加密
   */
  static async encryptPasswordEntry(
    data: Omit<PasswordData, 'randomIV'>, 
    dataKey: CryptoKey
  ): Promise<EncryptedData> {
    // 1. 生成随机 IV 作为数据的一部分
    const randomIV = crypto.getRandomValues(new Uint8Array(16));
    
    // 2. 构造完整的数据对象
    const fullData: PasswordData = {
      ...data,
      randomIV: Buffer.from(randomIV).toString('base64')
    };
    
    // 3. 将整个对象序列化
    const jsonData = JSON.stringify(fullData);
    
    // 4. 生成加密用的 IV
    const encryptionIV = crypto.getRandomValues(new Uint8Array(12));
    
    // 5. 加密整个数据
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: encryptionIV
      },
      dataKey,
      new TextEncoder().encode(jsonData)
    );

    // 6. 返回加密结果
    return {
      ciphertext: Buffer.from(encryptedData).toString('base64'),
      iv: Buffer.from(encryptionIV).toString('base64'),
      tag: ''
    };
  }

  /**
   * 解密密码条目
   */
  static async decryptPasswordEntry(
    encryptedData: EncryptedData, 
    dataKey: CryptoKey
  ): Promise<PasswordData> {
    // 1. 解密数据
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: Buffer.from(encryptedData.iv, 'base64')
      },
      dataKey,
      Buffer.from(encryptedData.ciphertext, 'base64')
    );

    // 2. 解析数据
    const jsonData = new TextDecoder().decode(decryptedData);
    return JSON.parse(jsonData) as PasswordData;
  }
} 