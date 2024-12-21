'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Table, Modal, Form, Input, Typography, Space, Card, Avatar, Tag } from 'antd';
import { PlusOutlined, WalletOutlined, EyeOutlined, EditOutlined, DeleteOutlined, LockOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';
import '../styles/password-manager.css';
import { useWallet } from '../hooks/useWallet';
import { getNetworkInfo } from '../config/networks';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

interface PasswordManagerProps {
  onWalletConnection: (connected: boolean, address: string) => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
  customContent?: React.ReactNode;
}

export default function PasswordManager({ 
  onWalletConnection, 
  isAuthenticated, 
  onLogout,
  customContent 
}: PasswordManagerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isConnected, address, network, connectWallet, disconnectWallet } = useWallet();

  // 监听钱包连接状态变化
  useEffect(() => {
    onWalletConnection(isConnected, address || '');
  }, [isConnected, address, onWalletConnection]);

  const demoData = [
    {
      key: '1',
      website: 'Google',
      username: 'demo@gmail.com',
      password: '********',
      lastModified: '2024-03-20',
      icon: 'G',
    },
    {
      key: '2',
      website: 'GitHub',
      username: 'demouser',
      password: '********',
      lastModified: '2024-03-19',
      icon: 'GH',
    },
  ];

  const columns = [
    {
      title: '网站/应用',
      dataIndex: 'website',
      key: 'website',
      width: '25%',
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: record.key === '1' ? '#4285F4' : '#2DA44E' }}>
            {record.icon}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: '25%',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password',
      width: '20%',
      render: () => <Text type="secondary">••••••••</Text>,
    },
    {
      title: '最后修改',
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: '15%',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} />
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const renderMainContent = () => {
    // 如果有自定义内容，显示自定义内容
    if (customContent) {
      return customContent;
    }

    // 否则显示密码管理界面
    return (
      <Card 
        bordered={false}
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 185, 107, 0.05)',
          background: '#FFFFFF',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space direction="vertical" size="small">
            <Title level={4} style={{ margin: 0 }}>密码列表</Title>
            <Text type="secondary">安全管理您的所有密码</Text>
          </Space>
          <Space size="middle">
            <Search
              placeholder="搜索密码"
              style={{ width: 250 }}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsModalVisible(true)}
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 185, 107, 0.25)',
              }}
            >
              添加密码
            </Button>
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={demoData}
          bordered={false}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
          }}
          style={{ marginTop: '8px' }}
        />

        <Modal
          title={
            <Space>
              <PlusOutlined style={{ color: '#00B96B' }} />
              <span>添加新密码</span>
            </Space>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={520}
          className="custom-modal"
          footer={[
            <Button 
              key="cancel" 
              onClick={() => setIsModalVisible(false)}
              style={{ borderRadius: '6px' }}
            >
              取消
            </Button>,
            <Button 
              key="submit" 
              type="primary"
              style={{ 
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 185, 107, 0.25)',
              }}
            >
              保存
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item 
              label="网站/应用" 
              required
              rules={[{ required: true, message: '请输入网站或应用名称' }]}
            >
              <Input 
                prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入网站或应用名称" 
              />
            </Form.Item>

            <Form.Item 
              label="用户名" 
              required
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入用户名" 
              />
            </Form.Item>

            <Form.Item 
              label="密码" 
              required
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入密码" 
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00B96B',
          borderRadius: 8,
          colorBgContainer: '#FFFFFF',
          colorBgLayout: '#FFFFFF',
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <Header style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF',
          padding: '0 24px',
          boxShadow: '0 4px 15px rgba(0, 185, 107, 0.05)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <Space size="middle">
            <LockOutlined style={{ fontSize: '24px', color: '#00B96B' }} />
            <Title level={3} style={{ margin: 0, color: '#1A1A1A' }}>
              KeySafe
            </Title>
          </Space>
          <Space>
            {network && (
              <div className="network-status-container">
                <Tag 
                  icon={
                    <img 
                      src={getNetworkInfo(network).logo} 
                      alt={getNetworkInfo(network).name}
                      style={{ 
                        width: '14px', 
                        height: '14px',
                        marginRight: '4px'
                      }} 
                    />
                  }
                  style={{ 
                    padding: '6px 12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: `${getNetworkInfo(network).color}15`,
                    color: getNetworkInfo(network).color,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '13px',
                    fontWeight: 500,
                    boxShadow: `0 2px 4px ${getNetworkInfo(network).color}10`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {getNetworkInfo(network).name}
                </Tag>
              </div>
            )}
            <Button 
              type={isConnected ? "default" : "primary"}
              icon={
                isConnected ? (
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    background: '#00B96B',
                    borderRadius: '50%',
                    marginRight: '8px',
                  }} />
                ) : (
                  <WalletOutlined />
                )
              }
              style={{ 
                borderRadius: '12px',
                padding: '4px 16px',
                height: '36px',
                background: isConnected 
                  ? 'rgba(0, 185, 107, 0.1)'
                  : 'linear-gradient(135deg, #00B96B 0%, #00D6A2 100%)',
                border: isConnected 
                  ? '1px solid rgba(0, 185, 107, 0.2)'
                  : 'none',
                color: isConnected ? '#00B96B' : '#fff',
                fontWeight: 500,
                fontSize: '13px',
                boxShadow: isConnected 
                  ? 'none' 
                  : '0 4px 12px rgba(0, 185, 107, 0.25)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                const button = e.currentTarget;
                button.style.transform = 'translateY(-1px)';
                if (!isConnected) {
                  button.style.boxShadow = '0 6px 16px rgba(0, 185, 107, 0.3)';
                } else {
                  button.style.background = 'rgba(0, 185, 107, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget;
                button.style.transform = 'translateY(0)';
                if (!isConnected) {
                  button.style.boxShadow = '0 4px 12px rgba(0, 185, 107, 0.25)';
                } else {
                  button.style.background = 'rgba(0, 185, 107, 0.1)';
                }
              }}
              onClick={() => isConnected ? disconnectWallet() : connectWallet()}
            >
              {isConnected ? (
                <Space size={4}>
                  <span>已连接</span>
                  <span style={{ 
                    opacity: 0.7,
                    fontSize: '12px',
                    color: '#00B96B'
                  }}>
                    ({address?.slice(0, 4)}...{address?.slice(-4)})
                  </span>
                </Space>
              ) : (
                "连接钱包"
              )}
            </Button>
            {isConnected && isAuthenticated && (
              <Button
                type="text"
                onClick={onLogout}
                style={{ color: '#ff4d4f' }}
              >
                退出登录
              </Button>
            )}
          </Space>
        </Header>
        
        <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {renderMainContent()}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}