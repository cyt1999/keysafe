'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Space, Button } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { SessionUtils } from '@/utils/sessionUtils';
import { SessionManager } from '@/services/SessionManager';
import { LogoIcon } from '@/components/common/Logo';
import { UserDropdown } from '@/components/specific/auth/UserDropdown';
import { useSyncStatus } from '@/hooks/useSyncStatus';

const { Header, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onLock?: () => void;
}

/**
 * 应用程序布局组件
 * 包含顶部导航栏和主要内容区域
 */
export function AppLayout({ children, address, onConnect, onDisconnect, onLock }: AppLayoutProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const { syncInfo } = useSyncStatus();

  useEffect(() => {
    if (address) {
      const userInfo = SessionManager.getInstance().getUserInfo();
      setAvatar(userInfo?.avatar || null);
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
        <Space size="middle">
          {address ? (
            <div className="user-info">
              <UserDropdown
                address={address}
                avatar={avatar}
                isUnlocked={isUnlocked}
                syncInfo={syncInfo}
                onLock={handleLock}
                onDisconnect={onDisconnect}
              />
            </div>
          ) : (
            <Button type="primary" icon={<WalletOutlined />} onClick={onConnect}>
              连接钱包
            </Button>
          )}
        </Space>
      </Header>
      <div className="content-wrapper">
        <Content className="content">
          {children}
        </Content>
      </div>
    </Layout>
  );
} 