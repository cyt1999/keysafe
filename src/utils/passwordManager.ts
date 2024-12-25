import { CryptoUtils } from './cryptoUtils';
import { PasswordEntry, EncryptedData } from './types';
import { PrismaClient } from '@prisma/client';

/**
 * 密码管理器类
 * 负责密码的加密存储和检索
 */
export class PasswordManager {
  private encryptionKey: CryptoKey | null = null;
  private prisma: PrismaClient;
  private userAddress: string;

  constructor(userAddress: string) {
    this.userAddress = userAddress;
    this.prisma = new PrismaClient();
  }

  /**
   * 设置加密密钥
   */
  async setEncryptionKey(walletSignature: string, masterKey: Buffer): Promise<void> {
    this.encryptionKey = await CryptoUtils.deriveEncryptionKey(walletSignature, masterKey);
  }

  /**
   * 加密并保存密码条目
   */
  async saveEntry(entry: PasswordEntry): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    try {
      // 加密数据
      const encryptedEntry = await CryptoUtils.encrypt(
        JSON.stringify(entry),
        this.encryptionKey
      );

      // 保存到数据库
      await this.prisma.passwordEntry.create({
        data: {
          id: entry.id,
          userId: this.userAddress,
          encryptedData: encryptedEntry.ciphertext,
          iv: encryptedEntry.iv,
          authTag: encryptedEntry.tag,
          version: 1
        }
      });
    } catch (error) {
      console.error('保存密码失败:', error);
      throw new Error('保存密码失败');
    }
  }

  /**
   * 获取所有密码条目
   */
  async getAllEntries(): Promise<PasswordEntry[]> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    try {
      // 从数据库获取所有条目
      const entries = await this.prisma.passwordEntry.findMany({
        where: {
          userId: this.userAddress
        }
      });

      // 解密所有条目
      const decryptedEntries = await Promise.all(
        entries.map(async (entry) => {
          const decrypted = await CryptoUtils.decrypt(
            {
              ciphertext: entry.encryptedData,
              iv: entry.iv,
              tag: entry.authTag
            },
            this.encryptionKey!
          );
          return JSON.parse(decrypted) as PasswordEntry;
        })
      );

      return decryptedEntries;
    } catch (error) {
      console.error('获取密码失败:', error);
      throw new Error('获取密码失败');
    }
  }

  /**
   * 更新密码条目
   */
  async updateEntry(entry: PasswordEntry): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    try {
      // 加密新数据
      const encryptedEntry = await CryptoUtils.encrypt(
        JSON.stringify(entry),
        this.encryptionKey
      );

      // 更新数据库
      await this.prisma.passwordEntry.update({
        where: {
          id: entry.id,
          userId: this.userAddress
        },
        data: {
          encryptedData: encryptedEntry.ciphertext,
          iv: encryptedEntry.iv,
          authTag: encryptedEntry.tag,
          version: { increment: 1 }
        }
      });
    } catch (error) {
      console.error('更新密码失败:', error);
      throw new Error('更新密码失败');
    }
  }

  /**
   * 删除密码条目
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      await this.prisma.passwordEntry.delete({
        where: {
          id: id,
          userId: this.userAddress
        }
      });
    } catch (error) {
      console.error('删除密码失败:', error);
      throw new Error('删除密码失败');
    }
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<void> {
    try {
      await this.prisma.passwordEntry.deleteMany({
        where: {
          userId: this.userAddress
        }
      });
    } catch (error) {
      console.error('清除数据失败:', error);
      throw new Error('清除数据失败');
    }
  }

  /**
   * 关闭数据库连接
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
} 