import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';
import { UserManager } from '../services/UserManager';
import { useWallet } from './useWallet';

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  createPassword: (password: string) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  isNewUser: boolean;
}

export function useUser(): UseUserReturn {
  const { address, isConnected } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const userManager = UserManager.getInstance();

  const loadUser = useCallback(async () => {
    if (!address) {
      setUser(null);
      setIsNewUser(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let currentUser = userManager.getUser(address);
      
      if (!currentUser) {
        setIsNewUser(true);
        currentUser = {
          address,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
          nickname: `User_${address.slice(2, 8)}...${address.slice(-4)}`,
          hasSetupPassword: false
        };
        setUser(currentUser);
      } else {
        setIsNewUser(false);
        setUser(currentUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户信息失败');
      console.error('加载用户信息失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const createPassword = useCallback(async (password: string) => {
    if (!address) {
      throw new Error('未连接钱包');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // 创建新用户并设置密码
      const newUser = userManager.createUser(address, password);
      setUser(newUser);
      setIsNewUser(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置密码失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!address || !user) {
      return false;
    }

    return userManager.verifyPassword(address, password);
  }, [address, user]);

  useEffect(() => {
    if (isConnected) {
      loadUser();
    } else {
      setUser(null);
      setIsNewUser(false);
    }
  }, [isConnected, loadUser]);

  return {
    user,
    isLoading,
    error,
    createPassword,
    verifyPassword,
    isNewUser
  };
} 