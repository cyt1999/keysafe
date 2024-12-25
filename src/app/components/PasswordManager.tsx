'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Table, Modal, Form, Input, Typography, Space, Card, Tag, message, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, WalletOutlined, EditOutlined, DeleteOutlined, LockOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';
import '../styles/password-manager.css';
import { useWallet } from '../hooks/useWallet';
import { getNetworkInfo } from '../config/networks';
import { PasswordManager as PasswordManagerClass } from '@/utils/passwordManager';
import { PasswordEntry } from '@/utils/types';
import { SessionUtils } from '@/utils/sessionUtils';
import { JsonRpcSigner } from 'ethers';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

interface PasswordManagerProps {
  onWalletConnection: (connected: boolean, address: string) => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
  customContent?: React.ReactNode;
}

export function PasswordManager({ onWalletConnection, isAuthenticated, onLogout = () => {}, customContent }: PasswordManagerProps) {
  const [passwordManager, setPasswordManager] = useState<PasswordManagerClass | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [form] = Form.useForm();
  const { address, connect, disconnect, provider } = useWallet();
  const [searchText, setSearchText] = useState('');
  const { message } = App.useApp();

  // 初始化密码管理器
  useEffect(() => {
    if (address && isAuthenticated && provider) {
      const manager = new PasswordManagerClass(address);
      setPasswordManager(manager);

      // 从会话中获取主密钥
      const session = SessionUtils.getSession();
      if (session?.masterKey && session?.signature) {
        // 直接加载密码列表
        loadPasswords(manager);
      } else {
        console.error('会话数据不完整');
        message.error('会话数据不完整，请重新登录');
        onLogout();
      }
    }
    return () => {
      if (passwordManager) {
        passwordManager.disconnect();
      }
    };
  }, [address, isAuthenticated, provider]);

  // 加载密码列表
  const loadPasswords = async (manager: PasswordManagerClass) => {
    try {
      const entries = await manager.getAllEntries();
      setPasswords(entries);
    } catch (error) {
      console.error('加载密码失败:', error);
      message.error('加载密码失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (!passwordManager) return;

    try {
      const entry: PasswordEntry = {
        id: editingPassword?.id || crypto.randomUUID(),
        ...values,
      };

      if (editingPassword) {
        await passwordManager.updateEntry(entry);
      } else {
        await passwordManager.saveEntry(entry);
      }

      await loadPasswords(passwordManager);
      setIsModalVisible(false);
      form.resetFields();
      setEditingPassword(null);
      message.success(editingPassword ? '密码已更新' : '密码已保存');
    } catch (error) {
      console.error('保存密码失败:', error);
      message.error('保存密码失败');
    }
  };

  // 处理删除密码
  const handleDelete = async (id: string) => {
    if (!passwordManager) return;

    try {
      await passwordManager.deleteEntry(id);
      await loadPasswords(passwordManager);
      message.success('密码已删除');
    } catch (error) {
      console.error('删除密码失败:', error);
      message.error('删除密码失败');
    }
  };

  // 处理编辑密码
  const handleEdit = (record: PasswordEntry) => {
    setEditingPassword(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
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

  return (
    <App>
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
            {customContent || (
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
    </App>
  );
}