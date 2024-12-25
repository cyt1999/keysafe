'use client';

import React from 'react';
import { Button, Typography, Space } from 'antd';
import { WalletOutlined, LockOutlined } from '@ant-design/icons';
import { useWallet } from '../../hooks/useWallet';

const { Title, Text } = Typography;

interface ConnectWalletProps {
  onConnection: (connected: boolean, address: string) => void;
}

export default function ConnectWallet({ onConnection }: ConnectWalletProps) {
  const { connect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      onConnection(true, '');
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <Space direction="vertical" size="large" align="center">
        <LockOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
        <Title level={2}>欢迎使用 PassKey</Title>
        <Text style={{ maxWidth: '500px', textAlign: 'center', marginBottom: '2rem' }}>
          PassKey 是一个去中心化的密码管理工具，帮助您安全地管理所有密码。
          请连接您的钱包开始使用。
        </Text>
        <Button 
          type="primary" 
          size="large" 
          icon={<WalletOutlined />}
          onClick={handleConnect}
        >
          连接钱包
        </Button>
      </Space>
    </div>
  );
} 