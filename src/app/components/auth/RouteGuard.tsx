'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionUtils } from '@/utils/sessionUtils';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/'];
const AUTH_PATHS = ['/auth/create', '/auth/verify'];
const PROTECTED_PATHS = ['/dashboard'];

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    const address = SessionUtils.getWalletAddress();
    const isUnlocked = await SessionUtils.isUnlocked();

    // 公开路由
    if (PUBLIC_PATHS.includes(pathname)) {
      if (address && isUnlocked) {
        // 已连接钱包且已解锁，直接进入主面板
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);
      return;
    }

    // 认证路由（创建/验证密码）
    if (AUTH_PATHS.includes(pathname)) {
      if (!address) {
        // 未连接钱包，返回欢迎页
        router.push('/');
        return;
      }
      if (isUnlocked) {
        // 已解锁，直接进入主面板
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);
      return;
    }

    // 受保护路由
    if (PROTECTED_PATHS.includes(pathname)) {
      if (!address) {
        // 未连接钱包，返回欢迎页
        router.push('/');
        return;
      }
      if (!isUnlocked) {
        // 未解锁，进入验证页面
        router.push('/auth/verify');
        return;
      }
      setAuthorized(true);
      return;
    }

    // 未知路由，返回欢迎页
    router.push('/');
  };

  return authorized ? children : null;
}
