import { PrismaClient, Prisma } from '@prisma/client';
import { IPFSService } from './IPFSService';

type PasswordEntryData = {
  id: string;
  encryptedData: string;
  version: number;
  updatedAt: string;
};

interface SyncData {
  passwords: PasswordEntryData[];
}

export class SyncService {
  private prisma: PrismaClient;
  private ipfsService: IPFSService;

  constructor(ipfsService: IPFSService) {
    this.prisma = new PrismaClient();
    this.ipfsService = ipfsService;
  }

  /**
   * 同步用户数据到IPFS
   * 可由定时任务或管理员手动触发
   */
  async syncToIPFS(userId: string): Promise<string> {
    try {
      // 获取所有密码数据
      const passwords = await this.prisma.passwordEntry.findMany({
        where: { userId },
        select: {
          id: true,
          encryptedData: true,
          version: true,
          updatedAt: true,
        },
      });

      // 构建同步数据结构
      const syncData: SyncData = {
        passwords: passwords.map((p) => ({
          id: p.id,
          encryptedData: p.encryptedData,
          version: p.version,
          updatedAt: p.updatedAt.toISOString(),
        })),
      };

      // 上传到IPFS
      const result = await this.ipfsService.uploadData(syncData, userId);

      // 更新同步状态
      await this.prisma.passwordSync.upsert({
        where: { userId },
        create: {
          userId,
          lastSyncedAt: new Date(),
          lastSyncedCid: result.cid,
          syncStatus: 'COMPLETED'
        },
        update: {
          lastSyncedAt: new Date(),
          lastSyncedCid: result.cid,
          syncStatus: 'COMPLETED',
          retryCount: 0,
          lastError: null
        }
      });

      return result.cid;
    } catch (error) {
      // 更新同步失败状态
      await this.prisma.passwordSync.upsert({
        where: { userId },
        create: {
          userId,
          lastSyncedAt: new Date(),
          syncStatus: 'FAILED',
          lastError: error instanceof Error ? error.message : '未知错误'
        },
        update: {
          lastSyncedAt: new Date(),
          syncStatus: 'FAILED',
          retryCount: {
            increment: 1
          },
          lastError: error instanceof Error ? error.message : '未知错误'
        }
      });

      console.error('同步到IPFS失败:', error);
      throw new Error('同步到IPFS失败');
    }
  }

  /**
   * 从IPFS恢复数据
   * 用于用户在新设备上恢复数据
   */
  async restoreFromIPFS(userId: string, cid: string): Promise<void> {
    try {
      // 从IPFS获取数据
      const syncData = await this.ipfsService.downloadData(cid) as unknown as SyncData;

      // 开启事务
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 删除现有的密码数据
        await tx.passwordEntry.deleteMany({
          where: { userId },
        });

        // 插入从IPFS恢复的数据
        for (const password of syncData.passwords) {
          await tx.passwordEntry.create({
            data: {
              id: password.id,
              userId,
              encryptedData: password.encryptedData,
              version: password.version,
              updatedAt: new Date(password.updatedAt),
            },
          });
        }

        // 更新同步状态
        await tx.passwordSync.upsert({
          where: { userId },
          create: {
            userId,
            lastSyncedAt: new Date(),
            lastSyncedCid: cid,
            syncStatus: 'COMPLETED'
          },
          update: {
            lastSyncedAt: new Date(),
            lastSyncedCid: cid,
            syncStatus: 'COMPLETED',
            retryCount: 0,
            lastError: null
          }
        });
      });
    } catch (error) {
      // 更新同步失败状态
      await this.prisma.passwordSync.upsert({
        where: { userId },
        create: {
          userId,
          lastSyncedAt: new Date(),
          syncStatus: 'FAILED',
          lastError: error instanceof Error ? error.message : '未知错误'
        },
        update: {
          lastSyncedAt: new Date(),
          syncStatus: 'FAILED',
          retryCount: {
            increment: 1
          },
          lastError: error instanceof Error ? error.message : '未知错误'
        }
      });

      console.error('从IPFS恢复数据失败:', error);
      throw new Error('从IPFS恢复数据失败');
    }
  }
} 