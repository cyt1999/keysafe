'use client';

import React, { useState } from 'react';
import {
  Layout,
  Space,
  Typography,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Tooltip,
  Tag,
  Empty,
  Spin,
  Input as AntInput,
  Progress,
  Slider,
  Checkbox,
  ConfigProvider,
  message,
  Dropdown,
  Alert,
} from 'antd';
import {
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { usePasswordManager } from '../hooks/usePasswordManager';
import { useWallet } from '../hooks/useWallet';
import { PasswordEntry, PasswordStrength, PasswordStrengthResult } from '../types/password';
import { getNetworkInfo } from '../config/networks';
import '../styles/password-manager.css';
import { PasswordStrengthChecker } from '../utils/passwordStrength';
import { PasswordGenerator, PasswordGeneratorConfig } from '../utils/passwordGenerator';
import Welcome from './Welcome';
import { shortenAddress } from '../utils/address';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Search } = AntInput;

/**
 * 密码管理器组件
 */
export default function PasswordManager() {
  // 状态管理
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [generatorConfig, setGeneratorConfig] = useState<PasswordGeneratorConfig>(
    PasswordGenerator.getDefaultConfig()
  );
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [unlockForm] = Form.useForm();

  // 使用自定义Hook
  const {
    passwords,
    loading,
    isLocked,
    addPassword,
    updatePassword,
    deletePassword,
    unlock,
    lock,
  } = usePasswordManager();

  // 获取钱包状态
  const { address, network, provider, connectWallet, disconnectWallet } = useWallet();

  // 过滤密码列表
  const filteredPasswords = passwords.filter(
    (item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.website?.toLowerCase().includes(searchText.toLowerCase()))
  );

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await updatePassword(editingId, values);
        message.success('更新成功');
      } else {
        await addPassword(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('操作失败:', error);
      if (error instanceof Error) {
        if (error.message === '会话已过期，请重新授权') {
          message.info('会话已过期，请重新解锁');
        } else {
          message.error(error.message || '操作失败');
        }
      } else {
        message.error('操作失败');
      }
    }
  };

  /**
   * 打开编辑模态框
   */
  const handleEdit = (record: PasswordEntry) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  /**
   * 处理删除操作
   */
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条密码记录吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => deletePassword(id),
    });
  };

  /**
   * 复制文本到剪贴板
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => message.success('复制成功'),
      () => message.error('复制失败')
    );
  };

  // 处理密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    if (password) {
      setPasswordStrength(PasswordStrengthChecker.check(password));
    } else {
      setPasswordStrength(null);
    }
    form.setFieldsValue({ password });
  };

  // 获取强度条颜色
  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case PasswordStrength.Weak:
        return '#ff4d4f';
      case PasswordStrength.Medium:
        return '#faad14';
      case PasswordStrength.Strong:
        return '#52c41a';
    }
  };

  /**
   * 生成随机密码
   */
  const generatePassword = () => {
    try {
      const password = PasswordGenerator.generate(generatorConfig);
      form.setFieldsValue({ password });
      // 触发密码强度检查
      setPasswordStrength(PasswordStrengthChecker.check(password));
    } catch (error) {
      message.error('生成密码失败');
    }
  };

  /**
   * 处理解锁
   */
  const handleUnlock = () => {
    setUnlockModalVisible(true);
  };

  /**
   * 处理解锁表单提交
   */
  const handleUnlockSubmit = async (values: any) => {
    try {
      const { masterPassword, confirmPassword } = values;
      
      if (masterPassword !== confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }

      await unlock(masterPassword);
      message.success('解锁成功');
      setUnlockModalVisible(false);
      unlockForm.resetFields();
    } catch (error) {
      console.error('解锁失败:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('解锁失败，请重试');
      }
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          {text}
          <Tooltip title="复制用户名">
            <CopyOutlined onClick={() => copyToClipboard(text)} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password',
      render: (text: string, record: PasswordEntry) => (
        <Space>
          <Input.Password
            value={text}
            visibilityToggle={{
              visible: showPassword[record.id],
              onVisibleChange: (visible) =>
                setShowPassword((prev) => ({ ...prev, [record.id]: visible })),
            }}
            readOnly
            bordered={false}
          />
          <Tooltip title="复制密码">
            <CopyOutlined onClick={() => copyToClipboard(text)} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '网站',
      dataIndex: 'website',
      key: 'website',
      render: (text: string) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : null,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PasswordEntry) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 渲染钱包连接或用户信息按钮
  const renderWalletButton = () => {
    if (!address) {
      return (
        <Button
          type="primary"
          icon={<UnlockOutlined />}
          onClick={connectWallet}
        >
          连接钱包
        </Button>
      );
    }

    return (
      <Dropdown
        menu={{
          items: [
            {
              key: 'disconnect',
              label: '断开连接',
              danger: true,
              onClick: disconnectWallet,
            },
          ],
        }}
      >
        <Button>
          <Space>
            <img 
              src={getNetworkInfo(network).logo} 
              alt="" 
              style={{ width: 16, height: 16 }} 
            />
            {shortenAddress(address)}
          </Space>
        </Button>
      </Dropdown>
    );
  };

  // 渲染主要内容
  const renderContent = () => {
    if (!address) {
      return <Welcome onConnect={connectWallet} />;
    }

    if (isLocked) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          minHeight: 'calc(100vh - 200px)',
        }}>
          <Space direction="vertical" size="large" align="center">
            <LockOutlined style={{ fontSize: 64, color: '#00B96B' }} />
            <Title level={2}>请解锁您的密码管理器</Title>
            <Button 
              type="primary" 
              size="large"
              icon={<UnlockOutlined />}
              onClick={handleUnlock}
            >
              解锁
            </Button>
          </Space>
        </div>
      );
    }

    return (
      <>
        <div style={{ 
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setModalVisible(true);
                setPasswordStrength(null);
              }}
            >
              添加密码
            </Button>
            <Button
              icon={<LockOutlined />}
              onClick={lock}
            >
              锁定
            </Button>
          </Space>
          <Search
            placeholder="搜索密码"
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredPasswords}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 800 }}
          className="password-table"
          locale={{
            emptyText: <Empty description="暂无数据" />,
          }}
        />

        {/* 添加/编辑密码对话框 */}
        <Modal
          title={editingId ? '编辑密码' : '添加密码'}
          open={modalVisible}
          onOk={form.submit}
          onCancel={() => {
            setModalVisible(false);
            setEditingId(null);
            form.resetFields();
          }}
          okText="确认"
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="请输入网站或应用名称" />
            </Form.Item>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                placeholder="请输入密码"
                onChange={handlePasswordChange}
                addonAfter={
                  <Tooltip title="生成随机密码">
                    <SyncOutlined onClick={generatePassword} />
                  </Tooltip>
                }
              />
            </Form.Item>
            <Form.Item label="密码生成器配置">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Slider
                  min={8}
                  max={32}
                  value={generatorConfig.length}
                  onChange={(value) => setGeneratorConfig(prev => ({ ...prev, length: value }))}
                  marks={{ 8: '8', 16: '16', 24: '24', 32: '32' }}
                />
                <Space wrap>
                  <Checkbox
                    checked={generatorConfig.useUppercase}
                    onChange={(e) => setGeneratorConfig(prev => ({ 
                      ...prev, 
                      useUppercase: e.target.checked 
                    }))}
                  >
                    大写字母
                  </Checkbox>
                  <Checkbox
                    checked={generatorConfig.useLowercase}
                    onChange={(e) => setGeneratorConfig(prev => ({ 
                      ...prev, 
                      useLowercase: e.target.checked 
                    }))}
                  >
                    小写字母
                  </Checkbox>
                  <Checkbox
                    checked={generatorConfig.useNumbers}
                    onChange={(e) => setGeneratorConfig(prev => ({ 
                      ...prev, 
                      useNumbers: e.target.checked 
                    }))}
                  >
                    数字
                  </Checkbox>
                  <Checkbox
                    checked={generatorConfig.useSpecial}
                    onChange={(e) => setGeneratorConfig(prev => ({ 
                      ...prev, 
                      useSpecial: e.target.checked 
                    }))}
                  >
                    特殊字符
                  </Checkbox>
                </Space>
              </Space>
            </Form.Item>
            {passwordStrength && (
              <div style={{ marginBottom: 24 }}>
                <Progress
                  percent={passwordStrength.score}
                  strokeColor={getStrengthColor(passwordStrength.strength)}
                  size="small"
                />
                <div style={{ marginTop: 8 }}>
                  {passwordStrength.suggestions.map((suggestion, index) => (
                    <Tag
                      key={index}
                      color="orange"
                      style={{ marginBottom: 4 }}
                    >
                      {suggestion}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            <Form.Item
              name="website"
              label="网站"
            >
              <Input placeholder="请输入网站地址（可选）" />
            </Form.Item>
          </Form>
        </Modal>
      </>
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
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          background: 'var(--color-bg-container)',
          boxShadow: '0 4px 15px rgba(0, 185, 107, 0.05)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <Space>
            <LockOutlined style={{ fontSize: '24px', color: '#00B96B' }} />
            <Title level={3} style={{ margin: 0 }}>密码管理器</Title>
          </Space>
          <Space>
            {network && (
              <Tag color={getNetworkInfo(network).color}>
                {getNetworkInfo(network).name}
              </Tag>
            )}
            {renderWalletButton()}
          </Space>
        </Header>

        <Content style={{ 
          padding: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}>
          <Spin spinning={loading}>
            {renderContent()}
          </Spin>
        </Content>

        {/* 解锁对话框 */}
        <Modal
          title="设置/输入主密码"
          open={unlockModalVisible}
          onCancel={() => {
            setUnlockModalVisible(false);
            unlockForm.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Form
            form={unlockForm}
            layout="vertical"
            onFinish={handleUnlockSubmit}
          >
            <Form.Item
              name="masterPassword"
              label="主密码"
              rules={[{ required: true, message: '请输入主密码' }]}
              extra="首次使用时，这将设置为您的主密码。之后使用时，请输入相同的主密码进行解锁。"
            >
              <Input.Password
                placeholder="请输入主密码"
                autoFocus
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认��密码"
              rules={[
                { required: true, message: '请确认主密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('masterPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
              extra="请再次输入主密码以确认"
            >
              <Input.Password
                placeholder="请再次输入主密码"
              />
            </Form.Item>
            <Alert
              message="重要提示"
              description={
                <ul style={{ paddingLeft: 16, marginBottom: 0 }}>
                  <li>主密码用于加密您的所有密码数据，请务必牢记。</li>
                  <li>如果忘记主密码，将无法恢复已保存的密码数据。</li>
                  <li>建议使用强密码，包含大小写字母、数字和特殊字符。</li>
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setUnlockModalVisible(false);
                  unlockForm.resetFields();
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  确认
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}