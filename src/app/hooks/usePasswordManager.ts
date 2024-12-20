import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isLocked, setIsLocked] = useState(true);
  const { signer } = useWallet();
  const passwordManagerRef = useRef<PasswordManagerService>();

  // 确保只创建一次 PasswordManagerService 实例
  if (!passwordManagerRef.current) {
    passwordManagerRef.current = new PasswordManagerService();
  }

  const passwordManager = passwordManagerRef.current;

  /**
   * 刷新密码列表
   */
  const refresh = useCallback(async () => {
    if (!signer || passwordManager.isLocked()) {
      setPasswords([]);
      return;
    }

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
      console.log('开始解锁密码管理器...');
      setLoading(true);
      setError(null);
      await passwordManager.unlock(signer, masterPassword);
      console.log('密码管理器解锁成功，更新状态...');
      setIsLocked(false);
      await refresh();
      console.log('解锁流程完成');
    } catch (error) {
      console.error('解锁失败:', error);
      setIsLocked(true);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer, passwordManager, refresh]);

  /**
   * 锁定密码管理器
   */
  const lock = useCallback(() => {
    console.log('锁定密码管理器...');
    passwordManager.lock();
    setIsLocked(true);
    setPasswords([]);
  }, [passwordManager]);

  /**
   * 添加密码
   */
  const addPassword = useCallback(async (entry: Omit<PasswordEntry, 'id'>) => {
    if (!signer || passwordManager.isLocked()) {
      throw new Error('请先解锁密码管理器');
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
    if (!signer || passwordManager.isLocked()) {
      throw new Error('请先解锁密码管理器');
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
    if (!signer || passwordManager.isLocked()) {
      throw new Error('请先解锁密码管理器');
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
      console.log('钱包断开连接，重置状态...');
      setPasswords([]);
      setIsLocked(true);
      passwordManager.lock();
    }
  }, [signer, passwordManager]);

  // 同步锁定状态
  useEffect(() => {
    setIsLocked(passwordManager.isLocked());
  }, [passwordManager]);

  return {
    passwords,
    loading,
    error,
    isLocked,
    addPassword,
    updatePassword,
    deletePassword,
    unlock,
    lock,
    refresh
  };
} 