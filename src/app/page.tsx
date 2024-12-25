'use client';

import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { PasswordManager } from './components/PasswordManager';
import { SessionUtils } from '@/utils/sessionUtils';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // 检查会话状态
  useEffect(() => {
    const checkSession = async () => {
      if (walletAddress) {
        const session = await SessionUtils.getSession();
        setIsAuthenticated(!!session);
      }
    };
    checkSession();
  }, [walletAddress]);

  const handleWalletConnection = (connected: boolean, address: string) => {
    setWalletAddress(address);
  };

  const handleLogout = () => {
    SessionUtils.clearSession();
    setIsAuthenticated(false);
    setWalletAddress('');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <PasswordManager
          onWalletConnection={handleWalletConnection}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      </Layout>
    </ConfigProvider>
  );
}
