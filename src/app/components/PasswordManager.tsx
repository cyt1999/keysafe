'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Modal, message } from 'antd';
import { useWallet } from '../hooks/useWallet';
import { PasswordEntry, PasswordData } from '@/utils/types';
import { CryptoUtils } from '@/utils/cryptoUtils';
import { SessionUtils } from '@/utils/sessionUtils';
import CreatePassword from './auth/CreatePassword';
import VerifyPassword from './auth/VerifyPassword';
import { AppLayout } from './layout/AppLayout';
import { PasswordList } from './password/PasswordList';
import { PasswordForm } from './password/PasswordForm';

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
  const [isUserExist, setIsUserExist] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 监听钱包连接状态
  useEffect(() => {
    const handleConnection = async () => {
      if (address) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/auth/verify?address=${address.toLowerCase()}`);
          if (response.ok) {
            setIsUserExist(true);
          } else if (response.status === 404) {
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
        onWalletConnection(true, address);
      } else {
        setIsUserExist(null);
      }
    };

    handleConnection();
  }, [address]);

  // 初始化并加载密码列表
  useEffect(() => {
    const initializePasswords = async () => {
      if (address && isAuthenticated) {
        try {
          const session = await SessionUtils.getSession();
          if (session?.dataKey) {
            await loadPasswords();
          } else {
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

      const decryptedPasswords = await Promise.all(
        encryptedEntries.map(async (entry: any) => {
          const decryptedData = await CryptoUtils.decryptPasswordEntry(
            entry.encryptedData,
            session.dataKey
          );
          return {
            id: entry.id,
            ...decryptedData,
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

  const handleSubmit = async (values: any) => {
    if (!address) return;

    try {
      const session = await SessionUtils.getSession();
      if (!session?.dataKey) {
        throw new Error('未找到数据密钥');
      }

      const passwordData: PasswordData = {
        title: values.title,
        username: values.username,
        password: values.password,
        website: values.website,
        notes: values.notes
      };

      const encryptedData = await CryptoUtils.encryptPasswordEntry(
        passwordData,
        session.dataKey
      );

      const endpoint = editingPassword ? '/api/passwords/update' : '/api/passwords/create';
      const method = editingPassword ? 'PUT' : 'POST';
      const body = editingPassword
        ? { id: editingPassword.id, encryptedData, walletAddress: address }
        : { encryptedData, walletAddress: address };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(editingPassword ? '更新密码失败' : '创建密码失败');
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

  const handleEdit = (record: PasswordEntry) => {
    setEditingPassword(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleAuthentication = (success: boolean) => {
    if (success) {
      onWalletConnection(true, address!);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsUserExist(null);
    SessionUtils.clearSession();
    if (onLogout) onLogout();
  };

  const renderContent = () => {
    if (!address) {
      return null;
    }

    if (isLoading) {
      return <div>正在检查用户状态...</div>;
    }

    if (isUserExist === null) {
      return <div>正在加载...</div>;
    }

    if (!isAuthenticated) {
      return isUserExist ? (
        <VerifyPassword onAuthentication={handleAuthentication} />
      ) : (
        <CreatePassword onAuthentication={handleAuthentication} />
      );
    }

    return customContent || (
      <Card>
        <PasswordList
          passwords={passwords}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => {
            setEditingPassword(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        />
      </Card>
    );
  };

  return (
    <>
      {contextHolder}
      <AppLayout
        address={address}
        onConnect={connect}
        onDisconnect={handleDisconnect}
      >
        {renderContent()}
        <Modal
          title={editingPassword ? '编辑密码' : '添加密码'}
          open={isModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingPassword(null);
          }}
          okText="确定"
          cancelText="取消"
        >
          <PasswordForm
            form={form}
            initialValues={editingPassword || undefined}
          />
        </Modal>
      </AppLayout>
    </>
  );
}