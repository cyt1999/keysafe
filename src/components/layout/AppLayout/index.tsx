'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Space, Button, Tag, Avatar } from 'antd';
import { LockOutlined, WalletOutlined, UserOutlined } from '@ant-design/icons';
import { SessionUtils } from '@/utils/sessionUtils';
import { LogoIcon } from '@/components/common/Logo';

const { Header, Content } = Layout;
const { Title } = Typography;

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