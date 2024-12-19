'use client';

import React, { useState } from 'react';
import { Layout, Button, Table, Modal, Form, Input, Typography, Space, Card, Avatar } from 'antd';
import { PlusOutlined, WalletOutlined, EyeOutlined, EditOutlined, DeleteOutlined, LockOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';
import '../styles/password-manager.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

export default function PasswordManager() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
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
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

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
              密码管理器
            </Title>
          </Space>
          <Button 
            type={isConnected ? "default" : "primary"}
            icon={<WalletOutlined />}
            size="large"
            onClick={() => setIsConnected(!isConnected)}
            style={{ 
              borderRadius: '20px',
              height: '40px',
              background: isConnected ? '#fff' : 'linear-gradient(45deg, #00B96B, #00D6A2)',
              boxShadow: isConnected ? 'none' : '0 4px 12px rgba(0, 185, 107, 0.25)',
            }}
          >
            {isConnected ? "已连接 (0x1234...5678)" : "连接钱包"}
          </Button>
        </Header>
        
        <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
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
                    boxShadow: '0 2px 8px rgba(117, 70, 201, 0.25)',
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
                showTotal: (total: any) => `共 ${total} 条记录`,
                showSizeChanger: true,
              }}
              style={{ marginTop: '8px' }}
            />
          </Card>

          <Modal
            title={
              <Space>
                <PlusOutlined style={{ color: '#7546C9' }} />
                <Text strong>添加新密码</Text>
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
                  boxShadow: '0 2px 8px rgba(117, 70, 201, 0.25)',
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
        </Content>
      </Layout>
    </ConfigProvider>
  );
}