import { PasswordEntry } from './types';
import { CryptoUtils } from './cryptoUtils';
import { SessionUtils } from './sessionUtils';

export class PasswordManager {
  private address: string;
  private encryptionKey: CryptoKey | null = null;

  constructor(address: string) {
    this.address = address.toLowerCase();
    // 从会话中获取加密密钥
    const session = SessionUtils.getSession();
    if (session?.masterKey && session?.signature) {
      CryptoUtils.deriveEncryptionKey(session.signature, session.masterKey)
        .then(key => {
          this.encryptionKey = key;
        })
        .catch(error => {
          console.error('获取加密密钥失败:', error);
          throw error;
        });
    }
  }

  // 不再需要单独设置加密密钥的方法，因为在构造函数中已经处理了
  private async ensureEncryptionKey(): Promise<void> {
    if (!this.encryptionKey) {
      const session = SessionUtils.getSession();
      if (!session?.masterKey || !session?.signature) {
        throw new Error('未找到会话数据，请重新登录');
      }
      this.encryptionKey = await CryptoUtils.deriveEncryptionKey(session.signature, session.masterKey);
    }
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
          userId: this.address,
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
          userId: this.address
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
          userId: this.address
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
   * 删除密��条目
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      await this.prisma.passwordEntry.delete({
        where: {
          id: id,
          userId: this.address
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
          userId: this.address
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