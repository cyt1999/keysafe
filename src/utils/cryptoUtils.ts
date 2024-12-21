import { Buffer } from 'buffer';

/**
 * 加密数据结构
 */
interface EncryptedData {
  iv: string;         // 初始化向量
  data: string;       // 加密后的数据
  authTag: string;    // GCM认证标签
}

export class CryptoUtils {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  /**
   * 从钱包签名和主密钥派生加密密钥
   */
  static async deriveEncryptionKey(walletSignature: string, masterKey: Buffer): Promise<CryptoKey> {
    // 组合钱包签名和主密钥
    const combinedKey = Buffer.concat([
      Buffer.from(walletSignature),
      masterKey
    ]);

    // 导入原始密钥材料
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      combinedKey,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // 使用PBKDF2派生AES密钥
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(16), // 使用固定盐值，因为我们已经有了随机的钱包签名
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 加密数据
   */
  static async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    // 生成随机IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 加密数据
    const encodedData = new TextEncoder().encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
        tagLength: 128
      },
      key,
      encodedData
    );

    // 分离密文和认证标签
    const encryptedContent = encryptedBuffer.slice(0, encryptedBuffer.byteLength - 16);
    const authTag = encryptedBuffer.slice(encryptedBuffer.byteLength - 16);

    return {
      iv: Buffer.from(iv).toString('base64'),
      data: Buffer.from(encryptedContent).toString('base64'),
      authTag: Buffer.from(authTag).toString('base64')
    };
  }

  /**
   * 解密数据
   */
  static async decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    // 解码IV和密文
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const data = Buffer.from(encryptedData.data, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');

    // 组合密文和认证标签
    const encryptedBuffer = Buffer.concat([data, authTag]);

    // 解密数据
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
        tagLength: 128
      },
      key,
      encryptedBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  }
} 