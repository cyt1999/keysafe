import { Buffer } from 'buffer';
import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

/**
 * 固定的签名消息
 */
const SIGN_MESSAGE = 'KEYSAFE_AUTH_V1';

/**
 * 加密工具类
 */
export class CryptoUtils {
  private static readonly ITERATIONS = 100000; // PBKDF2 迭代次数
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly SALT_LENGTH = 16; // 128 bits
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * 生成随机ID
   */
  static generateId(): string {
    return ethers.utils.id(Date.now().toString() + Math.random().toString()).slice(2, 34);
  }

  /**
   * 从主密码派生密钥
   */
  public static deriveKey(masterPassword: string, salt: Buffer): Buffer {
    console.log('Deriving key with:', {
      masterPassword,
      salt: salt.toString('hex')
    });
    
    const key = pbkdf2Sync(
      masterPassword,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    );
    
    console.log('Derived key:', key.toString('hex'));
    return key;
  }

  /**
   * 生成随机盐值
   */
  public static generateSalt(): Buffer {
    const salt = randomBytes(this.SALT_LENGTH);
    console.log('Generated salt:', salt.toString('hex'));
    return salt;
  }

  /**
   * 生成随机验证字符串
   */
  public static generateVerificationString(): Buffer {
    const verificationString = randomBytes(32);
    console.log('Generated verification string:', verificationString.toString('hex'));
    return verificationString;
  }

  /**
   * 加密数据
   */
  public static encrypt(data: Buffer, key: Buffer): {
    encrypted: Buffer;
    iv: Buffer;
    authTag: Buffer;
  } {
    console.log('Encrypting data:', {
      data: data.toString('hex'),
      key: key.toString('hex')
    });

    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, key, iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    console.log('Encryption result:', {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });

    return { encrypted, iv, authTag };
  }

  /**
   * 解密数据
   */
  public static decrypt(
    encrypted: Buffer,
    key: Buffer,
    iv: Buffer,
    authTag: Buffer
  ): Buffer {
    console.log('Decrypting data:', {
      encrypted: encrypted.toString('hex'),
      key: key.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });

    const decipher = createDecipheriv(this.ALGORITHM, key, iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    console.log('Decryption result:', decrypted.toString('hex'));
    return decrypted;
  }

  /**
   * 创建主密码验证数据
   */
  public static createMasterPasswordVerification(
    masterPassword: string
  ): {
    salt: string;
    verificationData: string;
  } {
    console.log('Creating verification data for password:', masterPassword);
    
    const salt = this.generateSalt();
    const key = this.deriveKey(masterPassword, salt);
    const verificationString = this.generateVerificationString();
    
    const { encrypted, iv, authTag } = this.encrypt(verificationString, key);
    
    // 将所有数据编码为 base64 字符串
    const verificationData = Buffer.concat([
      encrypted,
      iv,
      authTag
    ]).toString('base64');
    
    const result = {
      salt: salt.toString('base64'),
      verificationData
    };
    
    console.log('Created verification data:', result);
    return result;
  }

  /**
   * 验证主密码
   */
  public static verifyMasterPassword(
    masterPassword: string,
    salt: string,
    verificationData: string
  ): boolean {
    console.log('Verifying master password:', {
      masterPassword,
      salt,
      verificationData
    });

    try {
      const saltBuffer = Buffer.from(salt, 'base64');
      const verificationBuffer = Buffer.from(verificationData, 'base64');
      
      // 解析验证数据
      const encrypted = verificationBuffer.slice(
        0,
        verificationBuffer.length - this.IV_LENGTH - this.AUTH_TAG_LENGTH
      );
      const iv = verificationBuffer.slice(
        verificationBuffer.length - this.IV_LENGTH - this.AUTH_TAG_LENGTH,
        verificationBuffer.length - this.AUTH_TAG_LENGTH
      );
      const authTag = verificationBuffer.slice(
        verificationBuffer.length - this.AUTH_TAG_LENGTH
      );

      console.log('Parsed verification data:', {
        encrypted: encrypted.toString('hex'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      });

      // 派生密钥并尝试解密
      const key = this.deriveKey(masterPassword, saltBuffer);
      this.decrypt(encrypted, key, iv, authTag);
      
      return true;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  /**
   * 获取签名消息
   */
  static getSignMessage(): string {
    return SIGN_MESSAGE;
  }
} 