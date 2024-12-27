'use client';

import React from 'react';
import { ConfigProvider, theme } from 'antd';
import ConnectWallet from '@/components/specific/auth/ConnectWallet';

export default function Home() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <ConnectWallet />
    </ConfigProvider>
  );
}
