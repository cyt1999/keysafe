'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, ConfigProvider, theme, App } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useWallet } from '../../hooks/useWallet';
import { CryptoUtils } from '@/utils/cryptoUtils';
import { SessionUtils } from '@/utils/sessionUtils';
import { PasswordManager } from '@/utils/passwordManager';

const { Title, Text } = Typography;

interface CreatePasswordProps {
  onAuthentication: (authenticated: boolean) => void;
}

function CreatePasswordContent({ onAuthentication }: CreatePasswordProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { address, provider } = useWallet();
  const { message } = App.useApp();

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!address || !provider) {
      message.error('钱包未连接');
      return;
    }

    try {
      setLoading(true);

      // 获取钱包签名
      const messageText = `KeySafe Authentication\nAddress: ${address}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageText);

      // 生成主密钥和主密钥哈希
      const { masterKey, masterKeyHash, salt } = await CryptoUtils.generateMasterKey(values.password);
      
      // 生成数据加密密钥
      const dataKey = await CryptoUtils.deriveDataKey(masterKey, signature);

      // 保存会话数据
      await SessionUtils.setDataKey(dataKey);

      // 保存验证数据到服务器
      const response = await fetch('/api/auth/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address.toLowerCase(),
          masterKeyHash,
          salt: Buffer.from(salt).toString('base64')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        if (response.status === 409) {
          message.error('该钱包地址已设置过主密码，请使用验证功能');
          return;
        }
        throw new Error(errorData.error || '设置主密码失败');
      }

      const data = await response.json();
      // 保存头像到本地存储，以便其他组件使用
      if (data.avatar) {
        localStorage.setItem(`avatar_${address.toLowerCase()}`, data.avatar);
      }

      message.success('主密码设置成功');
      onAuthentication(true);
    } catch (error) {
      console.error('设置主密码失败:', error);
      message.error('设置主密码失败');
    } finally {
      setLoading(false);
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
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>设置主密码</Title>
          <Text>
            请设置一个安全的主密码，它将用于加密您的所有数据。
            请确保记住个密码，因为它无法找回。
          </Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label="主密码"
            rules={[
              { required: true, message: '请输入主密码' },
              { min: 8, message: '密码长度少为8位' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: '密码必须包含大小写字母和数字'
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="请输入主密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认主密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入主密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              设置主密码
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
}

export default function CreatePassword(props: CreatePasswordProps) {
  return (
    <App>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <CreatePasswordContent {...props} />
      </ConfigProvider>
    </App>
  );
} 