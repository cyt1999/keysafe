'use client';

import React from 'react';
import { Form, Input } from 'antd';
import { LockOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { PasswordEntry } from '@/utils/types';

interface PasswordFormProps {
  form: any;
  initialValues?: PasswordEntry;
}

export function PasswordForm({ form, initialValues }: PasswordFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || {}}
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
  );
} 