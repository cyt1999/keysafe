'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useWallet } from '../../hooks/useWallet';
import { CryptoUtils } from '@/utils/cryptoUtils';
import { SessionUtils } from '@/utils/sessionUtils';

const { Title, Text } = Typography;

interface VerifyPasswordProps {
  onAuthentication: (authenticated: boolean) => void;
}

export default function VerifyPassword({ onAuthentication }: VerifyPasswordProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { address, provider } = useWallet();

  const handleSubmit = async (values: { password: string }) => {
    if (!address || !provider) {
      message.error('钱包未连接');
      return;
    }

    try {
      setLoading(true);

      // 获取钱包签名
      const messageText = `PassKey Authentication\nAddress: ${address}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageText);

      // 生成主密钥
      const masterKey = await CryptoUtils.generateMasterKey(values.password);
      
      // 生成加密密钥
      await CryptoUtils.deriveEncryptionKey(signature, masterKey);

      // 保存会话数据
      SessionUtils.createSession(address, masterKey);

      // 验证密码
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          masterKey: masterKey.toString('hex'),
        }),
      });

      if (!response.ok) {
        throw new Error('验证失败');
      }

      message.success('验证成功');
      onAuthentication(true);
    } catch (error) {
      console.error('验证失败:', error);
      message.error('密码错误');
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
          <Title level={2}>验证主密码</Title>
          <Text>
            请输入您的主密码以访问密码库。
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
              { required: true, message: '请输入主密码' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="请输入主密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              验证密码
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
} 