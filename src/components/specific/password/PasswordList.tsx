'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { PasswordEntry } from '@/utils/types';

const { Search } = Input;

interface PasswordListProps {
  passwords: PasswordEntry[];
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function PasswordList({ passwords, onEdit, onDelete, onAdd }: PasswordListProps) {
  const [searchText, setSearchText] = useState('');

  const columns: ColumnsType<PasswordEntry> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (_, record) =>
        record.title.toLowerCase().includes((searchText || '').toLowerCase()) ||
        record.username.toLowerCase().includes((searchText || '').toLowerCase()) ||
        (record.website || '').toLowerCase().includes((searchText || '').toLowerCase()),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '网站',
      dataIndex: 'website',
      key: 'website',
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
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
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
} 