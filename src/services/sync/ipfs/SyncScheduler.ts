import { PrismaClient } from '@prisma/client';
import { SyncService } from './SyncService';

interface SyncResult {
  success: boolean;
  totalUsers: number;
  successCount: number;
  failedUsers: Array<{
    userId: string;
    error: string;
  }>;
}

export class SyncScheduler {
  private prisma: PrismaClient;
  private syncService: SyncService;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(syncService: SyncService) {
    this.prisma = new PrismaClient();
    this.syncService = syncService;
  }

  /**
   * 获取同步服务实例
   */
  getSyncService(): SyncService {
    return this.syncService;
  }

  /**
   * 启动定时同步任务
   */
  start(): void {
    // 获取同步间隔配置（默认24小时）
    const syncInterval = parseInt(process.env.IPFS_SYNC_INTERVAL || '86400000');
    
    // 启动定时任务
    this.intervalId = setInterval(async () => {
      try {
        const result = await this.syncAll();
        if (result.failedUsers.length > 0) {
          console.error('定时同步部分失败:', result);
        }
      } catch (error) {
        console.error('同步任务执行失败:', error);
      }
    }, syncInterval);
  }

  /**
   * 停止定时同步任务
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 手动触发同步（管理员使用）
   * @returns 同步结果，包含成功和失败的统计
   */
  async syncAll(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      totalUsers: 0,
      successCount: 0,
      failedUsers: []
    };

    try {
      const users = await this.prisma.user.findMany();
      result.totalUsers = users.length;
      
      for (const user of users) {
        try {
          await this.syncService.syncToIPFS(user.id);
          result.successCount++;
        } catch (error) {
          result.failedUsers.push({
            userId: user.id,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      // 如果有任何用户同步失败，设置整体状态为失败
      if (result.failedUsers.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error) {
      console.error('全量同步任务执行失败:', error);
      throw new Error('全量同步任务执行失败');
    }
  }
} 