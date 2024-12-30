'use client';

import React from 'react';
import { Avatar, Dropdown, MenuProps } from 'antd';
import { LockOutlined, WalletOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import '@/styles/components/avatar.css';
import '@/styles/components/dropdown.css';

interface UserDropdownProps {
  address: string | null;
  avatar: string | null;
  isUnlocked: boolean;
  onLock: () => void;
  onDisconnect: () => void;
}

export function UserDropdown({ address, avatar, isUnlocked, onLock, onDisconnect }: UserDropdownProps) {
  const username = 'xiamu';

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="user-dropdown-info">
          <Avatar 
            size={40}
            icon={<UserOutlined />}
            src={avatar}
            className="user-info-avatar"
          />
          <div className="user-dropdown-text">
            <div className="user-dropdown-username">
              {username}
            </div>
            <div className="user-dropdown-address">
              <WalletOutlined />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
            </div>
          </div>
        </div>
      ),
      style: { cursor: 'default' },
      disabled: true
    },
    {
      type: 'divider',
      key: 'divider'
    },
    {
      key: 'lock',
      icon: <LockOutlined />,
      label: '锁定',
      onClick: onLock,
      disabled: !isUnlocked
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '注销',
      onClick: onDisconnect
    }
  ];

  const dropdownItems: MenuProps = {
    items: menuItems
  };

  return (
    <Dropdown 
      menu={dropdownItems} 
      placement="bottomRight"
    >
      <Avatar 
        size={44}
        icon={<UserOutlined />}
        src={avatar}
        className="gradient-avatar"
      />
    </Dropdown>
  );
} 