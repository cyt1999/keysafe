'use client';

import { RouteGuard } from './components/auth/RouteGuard';
import { ConfigProvider, theme } from 'antd';
import AntdRegistry from './components/AntdRegistry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              algorithm: theme.defaultAlgorithm,
            }}
          >
            <RouteGuard>{children}</RouteGuard>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
