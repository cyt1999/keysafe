'use client';

import React from 'react';
import { Avatar, Dropdown, MenuProps, message } from 'antd';
import { LockOutlined, WalletOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

/**
 * UserDropdown组件的属性接口
 * @interface UserDropdownProps
 * @property {string | null} address - 用户的钱包地址
 * @property {string | null} avatar - 用户头像的URL
 * @property {boolean} isUnlocked - 是否已解锁（是否已输入主密码）
 * @property {Object} [syncInfo] - IPFS同步状态信息（可选）
 * @property {string | null} syncInfo.lastSyncedCid - 最后同步的IPFS CID
 * @property {string} syncInfo.lastSyncedAt - 最后同步时间
 * @property {string} syncInfo.syncStatus - 同步状态（PENDING/SYNCING/COMPLETED/FAILED）
 * @property {() => void} onLock - 锁定功能的回调函数
 * @property {() => void} onDisconnect - 断开连接的回调函数
 */
interface UserDropdownProps {
  address: string | null;
  avatar: string | null;
  isUnlocked: boolean;
  syncInfo?: {
    lastSyncedCid: string | null;
    lastSyncedAt: string;
    syncStatus: string;
  };
  onLock: () => void;
  onDisconnect: () => void;
}

/**
 * 用户下拉菜单组件
 * 显示用户信息、同步状态和操作选项
 */
export function UserDropdown({ address, avatar, isUnlocked, syncInfo, onLock, onDisconnect }: UserDropdownProps) {
  const username = 'xiamu';
  const [messageApi, contextHolder] = message.useMessage();

  // 复制CID到剪贴板
  const handleCopyCID = async (cid: string) => {
    try {
      await navigator.clipboard.writeText(cid);
      messageApi.success('CID已复制到剪贴板');
    } catch (err) {
      console.error('复制CID失败:', err);
      messageApi.error('复制CID失败');
    }
  };

  // 配置下拉菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="user-dropdown-info">
          {contextHolder}
          {/* 用户头像 */}
          <Avatar 
            size={40}
            icon={<UserOutlined />}
            src={avatar}
            className="user-info-avatar"
          />
          <div className="user-dropdown-text">
            {/* 用户名显示 */}
            <div className="user-dropdown-username">
              {username}
            </div>
            {/* 钱包地址显示（显示前6位和后4位） */}
            <div className="user-dropdown-address">
              <WalletOutlined />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
            </div>
            {/* IPFS同步状态信息 */}
            {syncInfo && (
              <div className="user-dropdown-sync">
                {/* 同步状态显示 */}
                <div className="sync-status">
                  同步状态: {syncInfo.syncStatus}
                </div>
                {/* CID信息显示（如果存在） */}
                {syncInfo.lastSyncedCid && (
                  <div 
                    className="sync-cid" 
                    title={syncInfo.lastSyncedCid}
                    onClick={() => handleCopyCID(syncInfo.lastSyncedCid!)}
                  >
                    CID: {`${syncInfo.lastSyncedCid.slice(0, 8)}...`}
                  </div>
                )}
                {/* 最后同步时间 */}
                <div className="sync-time">
                  最后同步: {new Date(syncInfo.lastSyncedAt).toLocaleString()}
                </div>
              </div>
            )}
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
    // 锁定选项
    {
      key: 'lock',
      icon: <LockOutlined />,
      label: '锁定',
      onClick: onLock,
      disabled: !isUnlocked
    },
    // 注销选项
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

  // 渲染下拉菜单组件
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