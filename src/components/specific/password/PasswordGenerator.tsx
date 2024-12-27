'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Slider, Checkbox, Space } from 'antd';
import { PasswordGenerator as Generator } from '@/utils/passwordGenerator';

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
}

export interface PasswordGeneratorRef {
  generatePassword: () => void;
}

export const PasswordGenerator = forwardRef<PasswordGeneratorRef, PasswordGeneratorProps>(
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
        // 确保至少有一个选项被选中
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
        <Space direction="vertical">
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