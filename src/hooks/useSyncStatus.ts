import { useState, useEffect } from 'react';

/**
 * 同步状态的数据接口
 */
interface SyncStatus {
  lastSyncedCid: string | null;
  lastSyncedAt: string;
  syncStatus: string;
}

/**
 * 获取IPFS同步状态的Hook
 * @returns {Object} 包含同步状态的对象
 */
export function useSyncStatus() {
  const [syncInfo, setSyncInfo] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const response = await fetch('/api/user/sync-status');
        if (!response.ok) {
          throw new Error('Failed to fetch sync status');
        }
        const data = await response.json();
        setSyncInfo(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSyncInfo(null);
      } finally {
        setLoading(false);
      }
    };

    // 初始加载
    fetchSyncStatus();

    // 设置定时刷新（每30秒）
    const interval = setInterval(fetchSyncStatus, 30000);

    // 清理函数
    return () => clearInterval(interval);
  }, []);

  return { syncInfo, loading, error };
} 