import { PrismaClient, Prisma } from '@prisma/client';
import { CryptoUtils } from '../utils/cryptoUtils';

export interface IPasswordData {
  title: string;
  username: string;
  password: string;
  website?: string;
}

type PasswordEntry = Prisma.PasswordEntryGetPayload<{}>;

export class PasswordService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 加密并存储密码数据
   */
  async savePassword(userId: string, data: IPasswordData, encryptionKey: CryptoKey): Promise<PasswordEntry> {
    try {
      // 将数据转换为JSON字符串并加密
      const jsonData = JSON.stringify(data);
      const encrypted = await CryptoUtils.encrypt(jsonData, encryptionKey);

      // 存储到数据库
      const entry = await this.prisma.passwordEntry.create({
        data: {
          userId,
          encryptedData: encrypted.data,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
        },
      });

      return entry;
    } catch (error) {
      console.error('保存密码失败:', error);
      throw new Error('保存密码失败');
    }
  }

  /**
   * 获取并解密密码数据
   */
  async getPassword(id: string, encryptionKey: CryptoKey): Promise<IPasswordData> {
    try {
      const entry = await this.prisma.passwordEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        throw new Error('密码条目不存在');
      }

      // 解密数据
      const decrypted = await CryptoUtils.decrypt(
        {
          data: entry.encryptedData,
          iv: entry.iv,
          authTag: entry.authTag,
        },
        encryptionKey
      );

      return JSON.parse(decrypted) as IPasswordData;
    } catch (error) {
      console.error('获取密码失败:', error);
      throw new Error('获取密码失败');
    }
  }

  /**
   * 获取用户的所有密码条目
   */
  async getAllPasswords(userId: string, encryptionKey: CryptoKey): Promise<IPasswordData[]> {
    try {
      const entries = await this.prisma.passwordEntry.findMany({
        where: { userId },
      });

      // 解密所有条目
      const decryptedEntries = await Promise.all(
        entries.map(async (entry) => {
          const decrypted = await CryptoUtils.decrypt(
            {
              data: entry.encryptedData,
              iv: entry.iv,
              authTag: entry.authTag,
            },
            encryptionKey
          );
          return JSON.parse(decrypted) as IPasswordData;
        })
      );

      return decryptedEntries;
    } catch (error) {
      console.error('获取密码列表失败:', error);
      throw new Error('获取密码列表失败');
    }
  }

  /**
   * 更新密码条目
   */
  async updatePassword(id: string, data: IPasswordData, encryptionKey: CryptoKey): Promise<PasswordEntry> {
    try {
      // 加密���数据
      const jsonData = JSON.stringify(data);
      const encrypted = await CryptoUtils.encrypt(jsonData, encryptionKey);

      // 更新数据库
      const entry = await this.prisma.passwordEntry.update({
        where: { id },
        data: {
          encryptedData: encrypted.data,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          version: { increment: 1 },
        },
      });

      return entry;
    } catch (error) {
      console.error('更新密码失败:', error);
      throw new Error('更新密码失败');
    }
  }

  /**
   * 删除密码条目
   */
  async deletePassword(id: string): Promise<void> {
    try {
      await this.prisma.passwordEntry.delete({
        where: { id },
      });
    } catch (error) {
      console.error('删除密码失败:', error);
      throw new Error('删除密码失败');
    }
  }
} 