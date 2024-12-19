'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { useServerInsertedHTML } from 'next/navigation';

/**
 * Ant Design 样式注册组件
 * 用于处理 Ant Design 在 Next.js 中的样式注入和配置
 * 包含 SSR 样式提取功能
 */
export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  // 创建样式缓存
  const cache = React.useMemo(() => createCache(), []);
  
  // 在服务端渲染时提取样式
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  return (
    <StyleProvider cache={cache} hashPriority="high">
      <ConfigProvider
        wave={{
          disabled: true // 禁用波纹效果
        }}
        theme={{
          token: {
            colorPrimary: '#00B96B',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
} 