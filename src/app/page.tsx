'use client';

import { useState, useEffect } from 'react';
import { Layout, Typography } from 'antd';
import { ConfigProvider, theme } from 'antd';
import { useRouter } from 'next/navigation';
import ConnectWallet from './components/auth/ConnectWallet';
import CreatePassword from './components/auth/CreatePassword';
import VerifyPassword from './components/auth/VerifyPassword';
import { PasswordManager } from './components/PasswordManager';
import { LockOutlined } from '@ant-design/icons';
import { SessionUtils } from '@/utils/sessionUtils';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // 检查会话状态
  useEffect(() => {
    if (walletAddress && SessionUtils.isValidSession(walletAddress)) {
      setIsAuthenticated(true);
    }
  }, [walletAddress]);

  const handleWalletConnection = (connected: boolean, address: string) => {
    setIsConnected(connected);
    setWalletAddress(address);
  };

  const handleAuthentication = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const handleLogout = () => {
    SessionUtils.clearSession();
    setIsAuthenticated(false);
    setIsConnected(false);
    setWalletAddress('');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {!isConnected ? (
          <ConnectWallet onConnection={handleWalletConnection} />
        ) : !isAuthenticated ? (
          walletAddress ? (
            <VerifyPassword
              walletAddress={walletAddress}
              onAuthentication={handleAuthentication}
            />
          ) : (
            <CreatePassword
              walletAddress={walletAddress}
              onAuthentication={handleAuthentication}
            />
          )
        ) : (
          <PasswordManager
            onWalletConnection={handleWalletConnection}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        )}
      </Layout>
    </ConfigProvider>
  );
}
