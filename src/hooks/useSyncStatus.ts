import { useState, useEffect } from 'react';
import { SessionManager } from '@/services/SessionManager';

/**
 * 同步状态的数据接口
 */
interface SyncStatus {
  lastSyncedCid: string | null;
  lastSyncedAt: string;
  syncStatus: string;
}

// 从环境变量获取刷新间隔，默认30秒
const SYNC_STATUS_INTERVAL = Number(process.env.NEXT_PUBLIC_SYNC_STATUS_INTERVAL) || 30000;

/**
 * 获取IPFS同步状态的Hook
 * @returns {Object} 包含同步状态的对象
 */
export function useSyncStatus() {
  const [syncInfo, setSyncInfo] = useState<SyncStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        // 获取用户信息
        const userInfo = SessionManager.getInstance().getUserInfo();
        if (!userInfo?.id) {
          setSyncInfo(undefined);
          return;
        }

        const response = await fetch('/api/user/sync-status', {
          headers: {
            'x-user-id': userInfo.id
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Sync status error:', errorData);
          throw new Error('Failed to fetch sync status');
        }
        const data = await response.json();
        console.log('Sync status data:', data);
        setSyncInfo(data);
        setError(null);
      } catch (err) {
        console.error('Sync status error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSyncInfo(undefined);
      } finally {
        setLoading(false);
      }
    };

    // 初始加载
    fetchSyncStatus();

    // 设置定时刷新
    const interval = setInterval(fetchSyncStatus, SYNC_STATUS_INTERVAL);

    // 清理函数
    return () => clearInterval(interval);
  }, []);

  return { syncInfo, loading, error };
} 