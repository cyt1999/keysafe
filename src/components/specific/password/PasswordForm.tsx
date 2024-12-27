'use client';

import React from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined, GlobalOutlined, UserOutlined, RedoOutlined } from '@ant-design/icons';
import { PasswordEntry } from '@/utils/types';
import { PasswordGenerator } from './PasswordGenerator';
import '@/styles/components/password/PasswordForm.css';

interface PasswordFormProps {
  form: any;
  initialValues?: PasswordEntry;
  onFinish?: (values: any) => void;
}

export function PasswordForm({ form, initialValues, onFinish }: PasswordFormProps) {
  const [generatorRef] = React.useState(() => ({
    generatePassword: () => {},
  }));

  const handleGeneratePassword = (password: string) => {
    form.setFieldValue('password', password);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || {}}
      onFinish={onFinish}
      className="password-form"
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[{ required: true, message: '请输入标题' }]}
      >
        <Input 
          placeholder="请输入网站或应用名称"
          prefix={<LockOutlined className="site-form-item-icon" />}
        />
      </Form.Item>
      <Form.Item
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input 
          placeholder="请输入用户名"
          prefix={<UserOutlined className="site-form-item-icon" />}
        />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password 
          placeholder="请输入密码"
          prefix={<LockOutlined className="site-form-item-icon" />}
          addonAfter={
            <Button
              type="text"
              icon={<RedoOutlined />}
              onClick={() => generatorRef.generatePassword()}
              style={{ border: 'none', padding: 0 }}
            />
          }
        />
      </Form.Item>

      <PasswordGenerator 
        onGenerate={handleGeneratePassword}
        ref={ref => {
          if (ref) {
            generatorRef.generatePassword = ref.generatePassword;
          }
        }}
      />

      <Form.Item name="website" label="网站">
        <Input 
          placeholder="请输入网站地址（可选）"
          prefix={<GlobalOutlined className="site-form-item-icon" />}
        />
      </Form.Item>
      <Form.Item name="notes" label="备注">
        <Input.TextArea 
          placeholder="请输入备注（可选）"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      </Form.Item>
    </Form>
  );
} 