import { PrismaClient } from '@prisma/client';
import { SyncService } from './SyncService';

export class SyncScheduler {
  private prisma: PrismaClient;
  private syncService: SyncService;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(syncService: SyncService) {
    this.prisma = new PrismaClient();
    this.syncService = syncService;
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
        // 获取所有用户
        const users = await this.prisma.user.findMany();
        
        // 为每个用户同步数据
        for (const user of users) {
          try {
            await this.syncService.syncToIPFS(user.id);
          } catch (error) {
            console.error(`用户 ${user.id} 同步失败:`, error);
            // 继续处理下一个用户
          }
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
   */
  async syncAll(): Promise<void> {
    try {
      const users = await this.prisma.user.findMany();
      
      for (const user of users) {
        try {
          await this.syncService.syncToIPFS(user.id);
        } catch (error) {
          console.error(`用户 ${user.id} 同步失败:`, error);
          // 继续处理下一个用户
        }
      }
    } catch (error) {
      console.error('手动同步任务执行失败:', error);
      throw new Error('手动同步任务执行失败');
    }
  }
} 