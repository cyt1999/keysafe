'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Table, Modal, Form, Input, Typography, Space, Card, Avatar, Tag, message } from 'antd';
import { PlusOutlined, WalletOutlined, EyeOutlined, EditOutlined, DeleteOutlined, LockOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';
import '../styles/password-manager.css';
import { useWallet } from '../hooks/useWallet';
import { getNetworkInfo } from '../config/networks';
import { PasswordManager as PasswordManagerClass } from '@/utils/passwordManager';
import { IPFSServiceImpl } from '@/utils/ipfsService';
import { SessionUtils } from '@/utils/sessionUtils';
import { PasswordEntry } from '@/utils/types';

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
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<PasswordEntry | null>(null);
  const [passwordManager, setPasswordManager] = useState<PasswordManagerClass | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { isConnected, address, network, connectWallet, disconnectWallet } = useWallet();

  // 监听钱包连接状态变化
  useEffect(() => {
    onWalletConnection(isConnected, address || '');
  }, [isConnected, address, onWalletConnection]);

  // 初始化PasswordManager
  useEffect(() => {
    if (isAuthenticated && address) {
      const ipfsService = new IPFSServiceImpl();
      const manager = new PasswordManagerClass(ipfsService);
      
      // 从会话中获取加密所需的信息
      const session = SessionUtils.getSession();
      if (session?.signature && session?.masterKey) {
        manager.setEncryptionKey(session.signature, session.masterKey)
          .then(() => {
            setPasswordManager(manager);
            // 加载已保存的密码
            loadPasswords(manager);
          })
          .catch(console.error);
      }
    }
  }, [isAuthenticated, address]);

  // 加载密码列表
  const loadPasswords = async (manager: PasswordManagerClass) => {
    try {
      setLoading(true);
      const entries = await manager.getAllEntries();
      setPasswords(entries);
    } catch (error) {
      console.error('加载密码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理添加密码
  const handleAddPassword = async (values: any) => {
    if (!passwordManager) {
      console.error('PasswordManager未初始化');
      return;
    }

    try {
      setLoading(true);
      const passwordEntry: PasswordEntry = {
        id: crypto.randomUUID(),
        title: values.website,
        username: values.username,
        password: values.password,
        website: values.website
      };

      await passwordManager.saveEntry(passwordEntry);
      await loadPasswords(passwordManager);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('保存密码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理删除密码
  const handleDeletePassword = async (id: string) => {
    if (!passwordManager) {
      console.error('PasswordManager未初始化');
      return;
    }

    try {
      setLoading(true);
      await passwordManager.deleteEntry(id);
      await loadPasswords(passwordManager);
    } catch (error) {
      console.error('删除密码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理编辑密码
  const handleEditPassword = async (values: any) => {
    if (!passwordManager || !currentPassword) {
      console.error('PasswordManager未初始化或没有选中的密码');
      return;
    }

    try {
      setLoading(true);
      const passwordEntry: PasswordEntry = {
        id: currentPassword.id,
        title: values.website,
        username: values.username,
        password: values.password,
        website: values.website
      };

      await passwordManager.saveEntry(passwordEntry);
      await loadPasswords(passwordManager);
      setIsEditModalVisible(false);
      form.resetFields();
      message.success('密码修改成功');
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理查看密码
  const handleViewPassword = (record: PasswordEntry) => {
    setCurrentPassword(record);
    setIsViewModalVisible(true);
  };

  // 处理编辑密码
  const handleEditPasswordClick = (record: PasswordEntry) => {
    setCurrentPassword(record);
    form.setFieldsValue({
      website: record.website,
      username: record.username,
      password: record.password
    });
    setIsEditModalVisible(true);
  };

  const columns = [
    {
      title: '网站/应用',
      dataIndex: 'website',
      key: 'website',
      width: '25%',
      render: (text: string, record: PasswordEntry) => (
        <Space>
          <Avatar style={{ backgroundColor: '#00B96B' }}>
            {text.charAt(0).toUpperCase()}
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
      title: '操作',
      key: 'action',
      render: (_: any, record: PasswordEntry) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewPassword(record)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEditPasswordClick(record)}
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeletePassword(record.id)}
          />
        </Space>
      ),
    },
  ];

  const renderMainContent = () => {
    if (customContent) {
      return customContent;
    }

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
          dataSource={passwords}
          loading={loading}
          bordered={false}
          rowKey="id"
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
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={520}
          className="custom-modal"
          footer={[
            <Button 
              key="cancel" 
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
              style={{ borderRadius: '6px' }}
            >
              取消
            </Button>,
            <Button 
              key="submit" 
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              style={{ 
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 185, 107, 0.25)',
              }}
            >
              保存
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddPassword}
          >
            <Form.Item 
              name="website"
              label="网站/应用" 
              rules={[{ required: true, message: '请输入网站或应用名称' }]}
            >
              <Input 
                prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入网站或应用名称" 
              />
            </Form.Item>

            <Form.Item 
              name="username"
              label="用户名" 
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入用户名" 
              />
            </Form.Item>

            <Form.Item 
              name="password"
              label="密码" 
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入密码" 
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 查看密码的Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined style={{ color: '#00B96B' }} />
              <span>查看密码</span>
            </Space>
          }
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button 
              key="close" 
              onClick={() => setIsViewModalVisible(false)}
              style={{ borderRadius: '6px' }}
            >
              关闭
            </Button>
          ]}
          width={520}
          className="custom-modal"
        >
          {currentPassword && (
            <div className="space-y-4">
              <div>
                <Text type="secondary">网站/应用：</Text>
                <Text strong>{currentPassword.website}</Text>
              </div>
              <div>
                <Text type="secondary">用户名：</Text>
                <Text strong>{currentPassword.username}</Text>
              </div>
              <div>
                <Text type="secondary">密码：</Text>
                <Text strong>{currentPassword.password}</Text>
              </div>
            </div>
          )}
        </Modal>

        {/* 编辑密码的Modal */}
        <Modal
          title={
            <Space>
              <EditOutlined style={{ color: '#00B96B' }} />
              <span>编辑密码</span>
            </Space>
          }
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            form.resetFields();
          }}
          width={520}
          className="custom-modal"
          footer={[
            <Button 
              key="cancel" 
              onClick={() => {
                setIsEditModalVisible(false);
                form.resetFields();
              }}
              style={{ borderRadius: '6px' }}
            >
              取消
            </Button>,
            <Button 
              key="submit" 
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              style={{ 
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 185, 107, 0.25)',
              }}
            >
              保存
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditPassword}
          >
            <Form.Item 
              name="website"
              label="网站/应用" 
              rules={[{ required: true, message: '请输入网站或应用名称' }]}
            >
              <Input 
                prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入网站或应用名称" 
              />
            </Form.Item>

            <Form.Item 
              name="username"
              label="用户名" 
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入用户名" 
              />
            </Form.Item>

            <Form.Item 
              name="password"
              label="密码" 
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
              icon={<WalletOutlined />}
              size="large"
              style={{ 
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                ...(isConnected ? {
                  background: 'rgba(0, 185, 107, 0.1)',
                  border: 'none',
                  color: '#00B96B'
                } : {
                  boxShadow: '0 4px 12px rgba(0, 185, 107, 0.25)'
                })
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