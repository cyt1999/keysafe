'use client';

import React from 'react';
import { Layout, Typography, Space, Button, Tag } from 'antd';
import { LockOutlined, WalletOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function AppLayout({ children, address, onConnect, onDisconnect }: AppLayoutProps) {
  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo-container">
          <LockOutlined className="logo-icon" />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            PassKey
          </Title>
        </div>
        <Space>
          {address ? (
            <>
              <Tag icon={<WalletOutlined />} color="success">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </Tag>
              <Button
                type="text"
                onClick={onDisconnect}
              >
                断开连接
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={onConnect}>
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