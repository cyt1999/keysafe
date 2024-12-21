'use client';

import { useState } from 'react';
import { StorageUtils } from '@/utils/storage';
import { SessionUtils } from '@/utils/sessionUtils';
import CreatePassword from './components/auth/CreatePassword';
import VerifyPassword from './components/auth/VerifyPassword';
import PasswordManager from './components/PasswordManager';
import { LockOutlined } from '@ant-design/icons';

export default function Home() {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleWalletConnection = (connected: boolean, walletAddress: string) => {
    setIsConnected(connected);
    setAddress(walletAddress);
    if (connected) {
      setIsNewUser(!StorageUtils.userExists(walletAddress));
      setIsAuthenticated(SessionUtils.isValidSession(walletAddress));
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    SessionUtils.clearSession();
    setIsAuthenticated(false);
  };

  // 根据状态返回不同的内容组件
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-4">欢迎使用 KeySafe</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            KeySafe 是一个去中心化的密码管理工具，帮助您安全地管理所有密码。
            请点击右上角的"连接钱包"按钮开始使用。
          </p>
          <div className="w-64 h-64 mb-8 opacity-80 flex items-center justify-center">
            <LockOutlined style={{ fontSize: '64px', color: '#00B96B' }} />
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return isNewUser ? (
        <CreatePassword address={address} onSuccess={handleAuthSuccess} />
      ) : (
        <VerifyPassword address={address} onSuccess={handleAuthSuccess} />
      );
    }

    return null; // 返回null让PasswordManager显示其默认内容
  };

  return (
    <PasswordManager
      onWalletConnection={handleWalletConnection}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      customContent={renderContent()}
    />
  );
}
