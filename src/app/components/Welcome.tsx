import React from 'react';
import { Typography, Button, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface WelcomeProps {
  onConnect: () => void;
}

export default function Welcome({ onConnect }: WelcomeProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <Space direction="vertical" size="large" align="center">
        <LockOutlined style={{ fontSize: 64, color: '#00B96B' }} />
        <Title level={2}>欢迎使用密码管理器</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          安全地管理您的所有密码，使用区块链技术保护您的数据安全
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          icon={<LockOutlined />}
          onClick={onConnect}
        >
          连接钱包开始使用
        </Button>
      </Space>
    </div>
  );
} 