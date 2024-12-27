'use client';

import React from 'react';
import { ConfigProvider, theme } from 'antd';
import ConnectWallet from './components/auth/ConnectWallet';

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
