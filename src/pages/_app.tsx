'use client';

import { RouteGuard } from '@/components/specific/auth/RouteGuard';
import { ConfigProvider, theme } from 'antd';
import AntdRegistry from '@/components/common/AntdRegistry';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
      </ConfigProvider>
    </AntdRegistry>
  );
}
