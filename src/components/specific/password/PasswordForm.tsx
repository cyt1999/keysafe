'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Button, Slider, Checkbox, Space } from 'antd';
import { LockOutlined, GlobalOutlined, UserOutlined, RedoOutlined, EyeOutlined, EyeInvisibleOutlined, TagOutlined } from '@ant-design/icons';
import { PasswordEntry } from '@/utils/types';
import { PasswordGenerator as Generator } from '@/utils/passwordGenerator';

interface PasswordFormProps {
  form: any;
  initialValues?: PasswordEntry;
  onFinish?: (values: any) => void;
}

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
}

interface PasswordGeneratorRef {
  generatePassword: () => void;
}

// 密码生成器组件
const PasswordGeneratorComponent = forwardRef<PasswordGeneratorRef, PasswordGeneratorProps>(
  ({ onGenerate }, ref) => {
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSpecial: true,
    });

    const handleOptionChange = (key: keyof typeof options) => {
      setOptions(prev => {
        const newOptions = { ...prev, [key]: !prev[key] };
        if (!Object.values(newOptions).some(v => v)) {
          return prev;
        }
        return newOptions;
      });
    };

    const generatePassword = () => {
      try {
        const password = Generator.generate({
          length,
          ...options,
        });
        onGenerate(password);
      } catch (error) {
        console.error('生成密码失败:', error);
      }
    };

    useImperativeHandle(ref, () => ({
      generatePassword,
    }));

    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: 'rgba(0, 0, 0, 0.85)' }}>
            密码生成器设置
          </div>
          <Slider
            min={8}
            max={32}
            step={1}
            value={length}
            onChange={setLength}
            marks={{
              8: '8',
              16: '16',
              24: '24',
              32: '32',
            }}
          />
        </div>
        <Space direction="horizontal">
          <Checkbox
            checked={options.useUppercase}
            onChange={() => handleOptionChange('useUppercase')}
          >
            大写字母
          </Checkbox>
          <Checkbox
            checked={options.useLowercase}
            onChange={() => handleOptionChange('useLowercase')}
          >
            小写字母
          </Checkbox>
          <Checkbox
            checked={options.useNumbers}
            onChange={() => handleOptionChange('useNumbers')}
          >
            数字
          </Checkbox>
          <Checkbox
            checked={options.useSpecial}
            onChange={() => handleOptionChange('useSpecial')}
          >
            特殊字符
          </Checkbox>
        </Space>
      </div>
    );
  }
);

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
          prefix={<TagOutlined className="site-form-item-icon" />}
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
          iconRender={(visible) => (
            <Space size={4}>
              {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              <div style={{ width: 1, height: 14, background: '#d9d9d9', margin: '0 4px' }} />
              <Button
                type="text"
                icon={<RedoOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  generatorRef.generatePassword();
                }}
                className="generate-password-btn"
                style={{ height: 24, width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Space>
          )}
        />
      </Form.Item>

      <div className="password-generator-settings">
        <PasswordGeneratorComponent 
          onGenerate={handleGeneratePassword}
          ref={ref => {
            if (ref) {
              generatorRef.generatePassword = ref.generatePassword;
            }
          }}
        />
      </div>

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