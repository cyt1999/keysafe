import { IPFSServiceImpl } from '@/utils/ipfsService';
import { SyncService } from './SyncService';
import { SyncScheduler } from './SyncScheduler';

let scheduler: SyncScheduler | null = null;

export function initializeServices() {
  if (scheduler) {
    return;
  }

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
}

export function getScheduler(): SyncScheduler {
  if (!scheduler) {
    throw new Error('服务未初始化');
  }
  return scheduler;
} 