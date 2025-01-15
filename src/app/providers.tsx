'use client';

import { RouteGuard } from '@/components/specific/auth/RouteGuard';
import { ConfigProvider, theme } from 'antd';
import AntdRegistry from '@/components/common/AntdRegistry';
import { Provider } from 'react-redux';
import { store } from '@/store';

// 1. Ant Design 基础样式
import 'antd/dist/reset.css';
// 2. 自定义全局样式
import '@/styles/index.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AntdRegistry>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
          }}
        >
          <RouteGuard>{children}</RouteGuard>
        </ConfigProvider>
      </AntdRegistry>
    </Provider>
  );
} 