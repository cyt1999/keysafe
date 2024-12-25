'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Table, Modal, Form, Input, Typography, Space, Card, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, WalletOutlined, EditOutlined, DeleteOutlined, LockOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';
import { useWallet } from '../hooks/useWallet';
import { PasswordEntry, PasswordData } from '@/utils/types';
import { CryptoUtils } from '@/utils/cryptoUtils';
import { SessionUtils } from '@/utils/sessionUtils';
import CreatePassword from './auth/CreatePassword';
import VerifyPassword from './auth/VerifyPassword';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

interface PasswordManagerProps {
  onWalletConnection: (connected: boolean, address: string) => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
  customContent?: React.ReactNode;
}

export function PasswordManager({ onWalletConnection, isAuthenticated, onLogout = () => {}, customContent }: PasswordManagerProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [form] = Form.useForm();
  const { address, connect, disconnect } = useWallet();
  const [searchText, setSearchText] = useState('');
  const [isUserExist, setIsUserExist] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 监听钱包连接状态
  useEffect(() => {
    if (address) {
      console.log('钱包已连接:', address);
      onWalletConnection(true, address);
    }
  }, [address]);

  // 检查用户是否存在
  useEffect(() => {
    const checkUser = async () => {
      if (!address) {
        setIsUserExist(null);
        return;
      }

      try {
        console.log('正在检查用户状态:', address);
        setIsLoading(true);
        const response = await fetch(`/api/auth/verify?address=${address.toLowerCase()}`);
        console.log('用户状态检查响应:', response.status);
        
        if (response.ok) {
          console.log('用户存在');
          setIsUserExist(true);
        } else if (response.status === 404) {
          console.log('用户不存在');
          setIsUserExist(false);
        } else {
          throw new Error('检查用户状态失败');
        }
      } catch (error) {
        console.error('检查用户状态失败:', error);
        messageApi.error('检查用户状态失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (address && !isAuthenticated) {
      console.log('触发用户状态检查:', { address, isAuthenticated });
      checkUser();
    }
  }, [address, isAuthenticated]);

  // 初始化并加载密码列表
  useEffect(() => {
    const initializePasswords = async () => {
      if (address && isAuthenticated) {
        try {
          // 从会话中获取数据密钥
          const session = await SessionUtils.getSession();
          if (session?.dataKey) {
            // 加载密码列表
            await loadPasswords();
          } else {
            console.error('会话数据不完整');
            messageApi.error('会话数据不完整，请重新登录');
            onLogout();
          }
        } catch (error) {
          console.error('初始化密码列表失败:', error);
          messageApi.error('初始化密码列表失败');
          onLogout();
        }
      }
    };

    initializePasswords();
  }, [address, isAuthenticated]);

  // 加载密码列表
  const loadPasswords = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/passwords/list?address=${address.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('获取密码列表失败');
      }

      const encryptedEntries = await response.json();
      const session = await SessionUtils.getSession();
      if (!session?.dataKey) {
        throw new Error('未找到数据密钥');
      }

      // 解密所有密码条目
      const decryptedPasswords = await Promise.all(
        encryptedEntries.map(async (entry: any) => {
          const decryptedData = await CryptoUtils.decryptPasswordEntry(
            JSON.parse(entry.encryptedData),
            session.dataKey
          );
          return {
            id: entry.id,
            title: decryptedData.title,
            username: decryptedData.username,
            password: decryptedData.password,
            website: decryptedData.website,
            notes: decryptedData.notes,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt)
          } as PasswordEntry;
        })
      );

      setPasswords(decryptedPasswords);
    } catch (error) {
      console.error('加载密码失败:', error);
      messageApi.error('加载密码失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (!address) return;

    try {
      const session = await SessionUtils.getSession();
      if (!session?.dataKey) {
        throw new Error('未找到数据密钥');
      }

      // 准备密码数据
      const passwordData: Omit<PasswordData, 'randomIV'> = {
        title: values.title,
        username: values.username,
        password: values.password,
        website: values.website,
        notes: values.notes
      };

      // 加密密码数据
      const encryptedData = await CryptoUtils.encryptPasswordEntry(
        passwordData,
        session.dataKey
      );

      if (editingPassword) {
        // 更新密���条目
        const response = await fetch('/api/passwords/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPassword.id,
            encryptedData,
            walletAddress: address
          })
        });

        if (!response.ok) {
          throw new Error('更新密码失败');
        }
      } else {
        // 创建新密码条目
        const response = await fetch('/api/passwords/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encryptedData,
            walletAddress: address
          })
        });

        if (!response.ok) {
          throw new Error('创建密码失败');
        }
      }

      await loadPasswords();
      setIsModalVisible(false);
      form.resetFields();
      setEditingPassword(null);
      messageApi.success(editingPassword ? '密码已更新' : '密码已保存');
    } catch (error) {
      console.error('保存密码失败:', error);
      messageApi.error('保存密码失败');
    }
  };

  // 处理删除密码
  const handleDelete = async (id: string) => {
    if (!address) return;

    try {
      const response = await fetch(`/api/passwords/delete?id=${id}&address=${address.toLowerCase()}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除密码失败');
      }

      await loadPasswords();
      messageApi.success('密码已删除');
    } catch (error) {
      console.error('删除密码失败:', error);
      messageApi.error('删除密码失败');
    }
  };

  // 处理编辑密码
  const handleEdit = (record: PasswordEntry) => {
    setEditingPassword(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 处理认证成功
  const handleAuthentication = (success: boolean) => {
    console.log('认证结果:', { success, address });
    if (success) {
      onWalletConnection(true, address!);
    }
  };

  // 表格列定义
  const columns: ColumnsType<PasswordEntry> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (_, record) =>
        record.title.toLowerCase().includes((searchText || '').toLowerCase()) ||
        record.username.toLowerCase().includes((searchText || '').toLowerCase()) ||
        (record.website || '').toLowerCase().includes((searchText || '').toLowerCase()),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '网站',
      dataIndex: 'website',
      key: 'website',
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // 渲染认证组件
  const renderAuthComponent = () => {
    if (!address) {
      return null;
    }

    if (isLoading) {
      return <div>正在检查用户状态...</div>;
    }

    if (isUserExist === null) {
      return <div>正在加载...</div>;
    }

    return isUserExist ? (
      <VerifyPassword onAuthentication={handleAuthentication} />
    ) : (
      <CreatePassword onAuthentication={handleAuthentication} />
    );
  };

  return (
    <>
      {contextHolder}
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
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
                    onClick={() => {
                      disconnect();
                      setIsUserExist(null);
                      if (onLogout) onLogout();
                    }}
                  >
                    断开连接
                  </Button>
                </>
              ) : (
                <Button type="primary" onClick={() => connect()}>
                  连接钱包
                </Button>
              )}
            </Space>
          </Header>
          <Content className="content">
            {address && !isAuthenticated ? (
              renderAuthComponent()
            ) : customContent || (
              <Card>
                <div className="toolbar">
                  <Search
                    placeholder="搜索密码..."
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingPassword(null);
                      form.resetFields();
                      setIsModalVisible(true);
                    }}
                  >
                    添加密码
                  </Button>
                </div>
                <Table
                  columns={columns}
                  dataSource={passwords}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )}
            <Modal
              title={editingPassword ? '编辑密码' : '添加密码'}
              open={isModalVisible}
              onOk={() => form.submit()}
              onCancel={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingPassword(null);
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={editingPassword || {}}
              >
                <Form.Item
                  name="title"
                  label="标题"
                  rules={[{ required: true, message: '请输入标题' }]}
                >
                  <Input prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item name="website" label="网站">
                  <Input prefix={<GlobalOutlined />} />
                </Form.Item>
                <Form.Item name="notes" label="备注">
                  <Input.TextArea />
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </ConfigProvider>
    </>
  );
}