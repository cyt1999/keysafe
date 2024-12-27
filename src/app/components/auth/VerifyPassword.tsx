'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, App, ConfigProvider, theme } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';
import { CryptoUtils } from '@/utils/cryptoUtils';
import { SessionUtils } from '@/utils/sessionUtils';

const { Title, Text } = Typography;

interface VerifyPasswordProps {}

function VerifyPasswordContent() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { address, provider } = useWallet();
  const { message } = App.useApp();
  const router = useRouter();

  const handleSubmit = async (values: { password: string }) => {
    if (!address || !provider) {
      message.error('钱包未连接');
      router.push('/');
      return;
    }

    try {
      setLoading(true);

      // 获取验证数据
      const response = await fetch(`/api/auth/verify?address=${address.toLowerCase()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取验证数据失败');
      }
      const { masterKeyHash, salt } = await response.json();

      // 获取钱包签名
      const messageText = `KeySafe Authentication\nAddress: ${address}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageText);

      // 验证密码并获取主密钥
      const masterKey = await CryptoUtils.verifyMasterPassword(
        values.password,
        Buffer.from(salt, 'base64'),
        masterKeyHash
      );

      // 生成数据加密密钥
      const dataKey = await CryptoUtils.deriveDataKey(masterKey, signature);
      
      // 保存会话数据
      await SessionUtils.setDataKey(dataKey);

      message.success('验证成功');
      router.push('/dashboard');
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

export default function VerifyPassword() {
  return (
    <App>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <VerifyPasswordContent />
      </ConfigProvider>
    </App>
  );
} 