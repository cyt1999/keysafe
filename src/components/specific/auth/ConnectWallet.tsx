'use client';

import React from 'react';
import { Button, Typography, Space, message } from 'antd';
import { WalletOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';

const { Title, Text } = Typography;

export default function ConnectWallet() {
  const { connect } = useWallet();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const handleConnect = async () => {
    try {
      const address = await connect();
      if (address) {
        // 检查用户是否存在
        const response = await fetch(`/api/auth/verify?address=${address.toLowerCase()}`);
        if (response.ok) {
          router.push('/auth/verify');
        } else if (response.status === 404) {
          router.push('/auth/create');
        } else {
          throw new Error('检查用户状态失败');
        }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      messageApi.error('连接钱包失败');
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '2rem'
      }}>
        <Space direction="vertical" size="large" align="center" style={{ maxWidth: '100%' }}>
          <LockOutlined style={{ fontSize: '64px', color: '#00B96B' }} />
          <Title level={2} style={{ 
            margin: 0, 
            color: '#2C3E50',
            fontSize: '24px',
            fontWeight: 600
          }}>欢迎使用 KeySafe</Title>
          <Text style={{ 
            maxWidth: '500px', 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: '#2C3E50',
            fontSize: '14px',
            lineHeight: '1.5',
            opacity: 0.85,
            padding: '0 1rem'
          }}>
            KeySafe 是一个去中心化的密码管理工具，帮助您安全地管理所有密码。
            请连接您的钱包开始使用。
          </Text>
          <Button 
            type="primary" 
            size="large" 
            icon={<WalletOutlined />}
            onClick={handleConnect}
            style={{ 
              height: '44px', 
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            连接钱包
          </Button>
        </Space>
      </div>
    </>
  );
} 