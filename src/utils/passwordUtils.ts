import { pbkdf2Sync, randomBytes } from 'crypto';

export interface MasterKeyData {
  salt: string;
  verificationString: string;
  encryptedVerificationString: string;
}

export class PasswordUtils {
  // PBKDF2参数
  private static ITERATIONS = 100000;
  private static KEY_LENGTH = 32;
  private static DIGEST = 'sha256';

  /**
   * 从主密码派生密钥
   */
  static deriveKey(masterPassword: string, salt: string): Buffer {
    return pbkdf2Sync(
      masterPassword,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.DIGEST
    );
  }

  /**
   * 创建新的主密码验证数据
   */
  static createMasterKeyData(masterPassword: string): MasterKeyData {
    // 生成随机盐值
    const salt = randomBytes(16).toString('hex');
    
    // 生成随机验证字符串
    const verificationString = randomBytes(16).toString('hex');
    
    // 派生密钥
    const derivedKey = this.deriveKey(masterPassword, salt);
    
    // 使用派生密钥加密验证字符串
    const encryptedVerificationString = this.encrypt(verificationString, derivedKey);

    return {
      salt,
      verificationString,
      encryptedVerificationString
    };
  }

  /**
   * 验证主密码
   */
  static verifyMasterPassword(
    masterPassword: string,
    salt: string,
    verificationString: string,
    encryptedVerificationString: string
  ): boolean {
    try {
      // 派生密钥
      const derivedKey = this.deriveKey(masterPassword, salt);
      
      // 解密验证字符串
      const decryptedVerificationString = this.decrypt(encryptedVerificationString, derivedKey);
      
      // 比较验证字符串
      return decryptedVerificationString === verificationString;
    } catch {
      return false;
    }
  }

  /**
   * 简单的加密函数（实际应用中应使用更安全的加密方法）
   */
  private static encrypt(data: string, key: Buffer): string {
    // 这里使用异或运算进行简单加密，实际应用中应使用AES等标准加密算法
    const dataBuffer = Buffer.from(data);
    const encrypted = Buffer.alloc(dataBuffer.length);
    
    for (let i = 0; i < dataBuffer.length; i++) {
      encrypted[i] = dataBuffer[i] ^ key[i % key.length];
    }
    
    return encrypted.toString('hex');
  }

  /**
   * 简单的解密函数（实际应用中应使用更安全的解密方法）
   */
  private static decrypt(encryptedData: string, key: Buffer): string {
    // 解密过程与加密相同（异或运算的特性）
    const encryptedBuffer = Buffer.from(encryptedData, 'hex');
    const decrypted = Buffer.alloc(encryptedBuffer.length);
    
    for (let i = 0; i < encryptedBuffer.length; i++) {
      decrypted[i] = encryptedBuffer[i] ^ key[i % key.length];
    }
    
    return decrypted.toString();
  }
} 