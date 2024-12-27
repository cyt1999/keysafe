'use client';

import { RouteGuard } from '@/components/specific/auth/RouteGuard';
import { ConfigProvider, theme } from 'antd';
import AntdRegistry from '@/components/common/AntdRegistry';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '@/store';
import Head from 'next/head';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Head>
        <title>KeySafe - 安全的密码管理工具</title>
      </Head>
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
    </Provider>
  );
}
