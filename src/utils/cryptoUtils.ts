import { Buffer } from 'buffer';
import { EncryptedData } from './types';

export class CryptoUtils {
  private static readonly SALT_LENGTH = 32;
  private static readonly KEY_LENGTH = 32;
  private static readonly ITERATIONS = 100000;
  private static readonly MASTER_KEY_SALT = new Uint8Array([
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
    0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20
  ]);

  /**
   * 生成主密钥
   */
  static async generateMasterKey(password: string): Promise<Buffer> {
    const key = await this.pbkdf2(password, this.MASTER_KEY_SALT);
    return Buffer.from(key);
  }

  /**
   * 从密码和盐值派生密钥
   */
  private static async pbkdf2(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    return crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      key,
      this.KEY_LENGTH * 8
    );
  }

  /**
   * 派生加密密钥
   */
  static async deriveEncryptionKey(signature: string, masterKey: Buffer): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      Buffer.concat([Buffer.from(signature), masterKey]),
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(0),
        info: new Uint8Array(0),
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 创建验证字符串
   */
  static async createVerificationString(signature: string, masterKey: Buffer): Promise<string> {
    const verificationData = {
      timestamp: Date.now(),
      signature
    };

    const key = await this.deriveEncryptionKey(signature, masterKey);
    const encrypted = await this.encrypt(JSON.stringify(verificationData), key);
    return JSON.stringify(encrypted);
  }

  /**
   * 加密数据
   */
  static async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      dataBuffer
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const ciphertext = encryptedArray.slice(0, -16);
    const tag = encryptedArray.slice(-16);

    return {
      ciphertext: Buffer.from(ciphertext).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      tag: Buffer.from(tag).toString('base64')
    };
  }

  /**
   * 解密数据
   */
  static async decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');

    const encryptedBuffer = Buffer.concat([ciphertext, tag]);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
} 