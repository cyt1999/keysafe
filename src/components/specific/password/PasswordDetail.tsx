'use client';

import React from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { PasswordEntry } from '@/utils/types';

interface PasswordDetailProps {
  password: PasswordEntry | null;
  open: boolean;
  onClose: () => void;
}

export function PasswordDetail({ password, open, onClose }: PasswordDetailProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      messageApi.success(`${type}已复制到剪贴板`);
    }).catch(() => {
      messageApi.error('复制失败');
    });
  };

  const handleVisitWebsite = (website: string | undefined) => {
    if (!website) return;
    const fullUrl = website.startsWith('http') ? website : `https://${website}`;
    window.open(fullUrl, '_blank');
  };

  if (!password) return null;

  return (
    <>
      {contextHolder}
      <Modal
        title="查看密码"
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" type="primary" onClick={onClose}>
            关闭
          </Button>
        ]}
        className="password-form-modal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={password}
          className="password-form"
        >
          <Form.Item
            label="网站/应用"
            name="title"
            rules={[{ required: true, message: '请输入网站/应用名称' }]}
          >
            <Input placeholder="请输入网站/应用名称" disabled />
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
            extra={
              <Button
                type="link"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(password.username, '用户名')}
                style={{ paddingLeft: 0 }}
              >
                复制用户名
              </Button>
            }
          >
            <Input placeholder="请输入用户名" disabled />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            extra={
              <Button
                type="link"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(password.password, '密码')}
                style={{ paddingLeft: 0 }}
              >
                复制密码
              </Button>
            }
          >
            <Input.Password placeholder="请输入密码" disabled />
          </Form.Item>

          <Form.Item
            label="网站地址"
            name="website"
            extra={
              password.website && (
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => handleVisitWebsite(password.website)}
                  style={{ paddingLeft: 0 }}
                >
                  访问网站
                </Button>
              )
            }
          >
            <Input placeholder="请输入网站地址" disabled />
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <Input.TextArea 
              placeholder="请输入备注信息" 
              rows={4} 
              disabled 
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
} 