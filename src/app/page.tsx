'use client';

import { ConnectWallet } from './components/auth/ConnectWallet';
import { LoginForm } from './components/auth/LoginForm';
import { useWallet } from './hooks/useWallet';
import { usePasswordManager } from './hooks/usePasswordManager';
import { useCallback } from 'react';

export default function Home() {
  const { isConnected } = useWallet();
  const { isLocked, refresh } = usePasswordManager();

  const handleLoginSuccess = useCallback(async () => {
    console.log('登录成功，刷新密码列表...');
    await refresh();
  }, [refresh]);

  // 渲染登录前的界面
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <ConnectWallet />
      </main>
    );
  }

  // 渲染登录界面
  if (isLocked) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <LoginForm onSuccess={handleLoginSuccess} />
      </main>
    );
  }

  // 渲染主界面
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">欢迎使用 KeySafe</h1>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            您已成功登录，可以开始管理您的密码了。
          </p>
          {/* 这里可以添加密码列表和管理功能 */}
        </div>
      </div>
    </main>
  );
}
