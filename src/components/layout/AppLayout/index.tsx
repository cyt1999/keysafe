'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Space, Button, Tag, Avatar, Dropdown } from 'antd';
import { LockOutlined, WalletOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
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

  const dropdownItems = {
    items: [
      {
        key: 'lock',
        icon: <LockOutlined />,
        label: '锁定',
        onClick: handleLock,
        disabled: !isUnlocked
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '注销',
        onClick: onDisconnect
      },
    ],
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header className="header">
        <div className="logo-container">
          <LogoIcon />
          <span className="logo-text">KeySafe</span>
        </div>
        <Space>
          {address ? (
            <div className="user-info">
              <Space>
                <Tag 
                  icon={<WalletOutlined />} 
                  color="success"
                >
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </Tag>
                <Dropdown menu={dropdownItems} placement="bottomRight">
                  <Avatar 
                    size={50}
                    icon={<UserOutlined />}
                    src={avatar}
                    style={{ cursor: 'pointer' }}
                  />
                </Dropdown>
              </Space>
            </div>
          ) : (
            <Button type="primary" icon={<WalletOutlined />} onClick={onConnect}>
              连接钱包
            </Button>
          )}
        </Space>
      </Header>
      <Content style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </Content>
    </Layout>
  );
} 