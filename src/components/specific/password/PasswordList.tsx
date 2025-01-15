'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined, LinkOutlined, EyeOutlined } from '@ant-design/icons';
import { PasswordEntry } from '@/utils/types';
import { WebsiteIcon } from '@/components/common/WebsiteIcon';

const { Search } = Input;

// 格式化URL显示
const formatUrl = (url: string): string => {
  if (!url) return '-';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname;
    // 移除开头的 www. 如果存在
    const cleanHostname = hostname.replace(/^www\./, '');
    return cleanHostname + '...';
  } catch (error) {
    console.error('Error parsing URL:', error);
    // 如果URL解析失败，返回原始值
    return url;
  }
};

// 格式化用户名显示
const formatUsername = (username: string, maxLength: number = 8): string => {
  if (!username) return '-';
  return username.length > maxLength ? `${username.slice(0, maxLength)}...` : username;
};

interface PasswordListProps {
  passwords: PasswordEntry[];
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onView: (password: PasswordEntry) => void;
}

export function PasswordList({ passwords, onEdit, onDelete, onAdd, onView }: PasswordListProps) {
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      messageApi.success(`${type}已复制到剪贴板`);
    }).catch(() => {
      messageApi.error('复制失败');
    });
  };

  const handleVisitWebsite = (url: string) => {
    if (!url) return;
    // 确保 URL 包含协议
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank');
  };

  const columns: ColumnsType<PasswordEntry> = [
    {
      title: '网站/应用',
      dataIndex: 'title',
      key: 'title',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (_, record) =>
        record.title.toLowerCase().includes((searchText || '').toLowerCase()) ||
        record.username.toLowerCase().includes((searchText || '').toLowerCase()) ||
        (record.website || '').toLowerCase().includes((searchText || '').toLowerCase()),
      render: (text: string) => (
        <Space>
          <WebsiteIcon name={text} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <span title={text}>{formatUsername(text)}</span>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(text, '用户名')}
          />
        </Space>
      ),
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password',
      render: (text: string) => (
        <Space>
          <span>••••••</span>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(text, '密码')}
          />
        </Space>
      ),
    },
    {
      title: '网站',
      dataIndex: 'website',
      key: 'website',
      render: (text: string) => (
        <Space>
          <span>{formatUrl(text)}</span>
          {text && (
            <Button
              type="text"
              icon={<LinkOutlined />}
              onClick={() => handleVisitWebsite(text)}
            />
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div>
        <div className="toolbar">
          <Search
            placeholder="搜索密码..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            添加密码
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={passwords}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </div>
    </>
  );
} 