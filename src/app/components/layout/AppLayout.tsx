'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Space, Button, Tag, Avatar } from 'antd';
import { LockOutlined, WalletOutlined, UserOutlined } from '@ant-design/icons';
import { SessionUtils } from '@/utils/sessionUtils';

const { Header, Content } = Layout;
const { Title } = Typography;

const LogoIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="40" height="40" rx="20" fill="#00B96B" fillOpacity="0.06" />
    <rect x="3" y="3" width="38" height="38" rx="19" stroke="#00B96B" strokeWidth="1.5" strokeOpacity="0.2" />
    <path
      d="M27 19a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"
      fill="#00B96B"
      fillOpacity="0.9"
    />
    <path
      d="M24 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
      fill="white"
    />
    <path
      d="M23 24h-2l-1 3h4z"
      fill="#00B96B"
      fillOpacity="0.9"
    />
    <path
      d="M15 28h14l-2 2H17z M18 31h8l-1 2h-6z"
      fill="#00B96B"
      fillOpacity="0.85"
    />
  </svg>
);

interface AppLayoutProps {
  children: React.ReactNode;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onLock?: () => void;
}

export function AppLayout({ children, address, onConnect, onDisconnect, onLock }: AppLayoutProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    if (address) {
      const savedAvatar = localStorage.getItem(`avatar_${address.toLowerCase()}`);
      setAvatar(savedAvatar);
    } else {
      setAvatar(null);
    }
  }, [address]);

  useEffect(() => {
    const checkLockStatus = async () => {
      if (address) {
        const unlocked = await SessionUtils.isUnlocked();
        setIsUnlocked(unlocked);
      } else {
        setIsUnlocked(false);
      }
    };
    checkLockStatus();
  }, [address]);

  const handleLock = () => {
    SessionUtils.clearDataKey();
    setIsUnlocked(false);
    if (onLock) onLock();
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo-container">
          <LogoIcon />
          <span className="logo-text">KeySafe</span>
        </div>
        <Space>
          {address ? (
            <div className="user-info">
              <Space>
                {isUnlocked && (
                  <Button 
                    icon={<LockOutlined />} 
                    onClick={handleLock}
                    title="锁定密码库"
                  >
                    锁定
                  </Button>
                )}
                <Tag 
                  icon={<WalletOutlined />} 
                  color="success"
                  onClick={onDisconnect}
                  title="点击断开连接"
                >
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </Tag>
                <Avatar 
                  size={40}
                  icon={<UserOutlined />}
                  src={avatar}
                />
              </Space>
            </div>
          ) : (
            <Button type="primary" icon={<WalletOutlined />} onClick={onConnect}>
              连接钱包
            </Button>
          )}
        </Space>
      </Header>
      <Content className="content">
        {children}
      </Content>
    </Layout>
  );
} 