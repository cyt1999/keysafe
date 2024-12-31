import { IPFSServiceImpl } from './sync/ipfs/IPFSService';
import { SyncService } from './sync/ipfs/SyncService';
import { SyncScheduler } from './sync/ipfs/SyncScheduler';

let scheduler: SyncScheduler | null = null;
let isInitialized = false;

/**
 * 初始化服务
 * 这个函数可以安全地多次调用，只会初始化一次
 */
export function initializeServices() {
  if (isInitialized) {
    return;
  }

  try {
    const ipfsService = new IPFSServiceImpl();
    const syncService = new SyncService(ipfsService);
    scheduler = new SyncScheduler(syncService);

    // 启动定时同步任务
    scheduler.start();

    // 确保在应用关闭时停止定时任务
    process.on('SIGTERM', () => {
      scheduler?.stop();
    });

    process.on('SIGINT', () => {
      scheduler?.stop();
    });

    isInitialized = true;
  } catch (error) {
    console.error('服务初始化失败:', error);
    throw error;
  }
}

/**
 * 获取调度器实例
 */
export function getScheduler(): SyncScheduler {
  if (!scheduler) {
    throw new Error('服务未初始化');
  }
  return scheduler;
}

/**
 * 检查服务是否已初始化
 */
export function isServicesInitialized(): boolean {
  return isInitialized;
} 