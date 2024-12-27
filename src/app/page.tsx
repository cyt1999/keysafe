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
      const address = SessionUtils.getWalletAddress();
      if (address) {
        setWalletAddress(address);
        const dataKey = await SessionUtils.getDataKey();
        setIsAuthenticated(!!dataKey);
      } else {
        setWalletAddress('');
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  const handleWalletConnection = (connected: boolean, address: string) => {
    setWalletAddress(address);
  };

  const handleLogout = () => {
    SessionUtils.clearWalletAddress();
    SessionUtils.clearDataKey();
    setIsAuthenticated(false);
    setWalletAddress('');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
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
