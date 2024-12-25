'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useWallet } from '../../hooks/useWallet';
import { CryptoUtils } from '@/utils/cryptoUtils';
import { SessionUtils } from '@/utils/sessionUtils';

const { Title, Text } = Typography;

interface CreatePasswordProps {
  onAuthentication: (authenticated: boolean) => void;
}

export default function CreatePassword({ onAuthentication }: CreatePasswordProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { address, provider } = useWallet();

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!address || !provider) {
      message.error('钱包未连接');
      return;
    }

    try {
      setLoading(true);

      // 获取钱包签名
      const message = `PassKey Authentication\nAddress: ${address}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // 生成主密钥
      const masterKey = await CryptoUtils.generateMasterKey(values.password);
      
      // 生成加密密钥
      await CryptoUtils.deriveEncryptionKey(signature, masterKey);

      // 创建验证字符串
      const verificationString = await CryptoUtils.createVerificationString(signature, masterKey);

      // 保存会话数据
      SessionUtils.createSession(address, masterKey);

      // 保存验证数据
      await fetch('/api/auth/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          verificationString,
        }),
      });

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
            请确保记住这个密码，因为它无法找回。
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
              { min: 8, message: '密码长度至少为8位' },
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