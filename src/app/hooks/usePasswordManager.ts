import { useState, useEffect, useCallback } from 'react';
import { PasswordEntry } from '../types/password';
import { PasswordManagerService } from '../services/PasswordManager';
import { useWallet } from './useWallet';

/**
 * 密码管理器Hook的返回类型
 */
interface UsePasswordManagerReturn {
  passwords: PasswordEntry[];
  loading: boolean;
  error: string | null;
  isLocked: boolean;
  addPassword: (entry: Omit<PasswordEntry, 'id'>) => Promise<void>;
  updatePassword: (id: string, updates: Partial<Omit<PasswordEntry, 'id'>>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  unlock: (masterPassword: string) => Promise<void>;
  lock: () => void;
  refresh: () => Promise<void>;
}

/**
 * 密码管理器Hook
 */
export function usePasswordManager(): UsePasswordManagerReturn {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordManager] = useState(() => new PasswordManagerService());
  const { signer } = useWallet();

  /**
   * 刷新密码列表
   */
  const refresh = useCallback(async () => {
    if (!signer) return;

    try {
      setLoading(true);
      setError(null);
      const data = await passwordManager.getPasswords();
      setPasswords(data);
    } catch (error) {
      console.error('获取密码失败:', error);
      setError(error instanceof Error ? error.message : '获取密码失败');
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  }, [signer, passwordManager]);

  /**
   * 解锁密码管理器
   */
  const unlock = useCallback(async (masterPassword: string) => {
    if (!signer) {
      throw new Error('请先连接钱包');
    }

    try {
      setLoading(true);
      setError(null);
      await passwordManager.unlock(signer, masterPassword);
      await refresh();
    } catch (error) {
      console.error('解锁失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer, passwordManager, refresh]);

  /**
   * 锁定密码管理器
   */
  const lock = useCallback(() => {
    passwordManager.lock();
    setPasswords([]);
  }, [passwordManager]);

  /**
   * 添加密码
   */
  const addPassword = useCallback(async (entry: Omit<PasswordEntry, 'id'>) => {
    if (!signer) {
      throw new Error('请先连接钱包');
    }

    try {
      setLoading(true);
      setError(null);
      await passwordManager.addPassword(entry);
      await refresh();
    } catch (error) {
      console.error('添加密码失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer, passwordManager, refresh]);

  /**
   * 更新密码
   */
  const updatePassword = useCallback(async (
    id: string,
    updates: Partial<Omit<PasswordEntry, 'id'>>
  ) => {
    if (!signer) {
      throw new Error('请先连接钱包');
    }

    try {
      setLoading(true);
      setError(null);
      await passwordManager.updatePassword(id, updates);
      await refresh();
    } catch (error) {
      console.error('更新密码失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer, passwordManager, refresh]);

  /**
   * 删除密码
   */
  const deletePassword = useCallback(async (id: string) => {
    if (!signer) {
      throw new Error('请先连接钱包');
    }

    try {
      setLoading(true);
      setError(null);
      await passwordManager.deletePassword(id);
      await refresh();
    } catch (error) {
      console.error('删除密码失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer, passwordManager, refresh]);

  // 监听钱包连接状态
  useEffect(() => {
    if (!signer) {
      setPasswords([]);
      return;
    }
  }, [signer]);

  return {
    passwords,
    loading,
    error,
    isLocked: passwordManager.isLocked(),
    addPassword,
    updatePassword,
    deletePassword,
    unlock,
    lock,
    refresh
  };
} 