'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';
import { useServerInsertedHTML } from 'next/navigation';
import '../styles/layout.css';

const themeConfig = {
  token: {
    colorPrimary: '#00B96B',
    colorBgContainer: '#FFFFFF',
    colorText: '#1A1A1A',
    colorBgElevated: '#FFFFFF',
    borderRadius: 8,
    colorBgLayout: '#FFFFFF',
    colorBorder: '#f0f0f0',
    boxShadowSecondary: '0 8px 24px rgba(0, 185, 107, 0.05)',
  },
  components: {
    Button: {
      colorPrimary: '#00B96B',
      algorithm: true,
      borderRadius: 8,
      controlHeight: 40,
    },
    Input: {
      colorBgContainer: '#FFFFFF',
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      borderRadius: 8,
      controlHeight: 40,
    },
    Modal: {
      borderRadiusLG: 16,
      paddingContentHorizontalLG: 24,
      paddingMD: 24,
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 8px 24px rgba(0, 185, 107, 0.05)',
    },
    Table: {
      borderRadius: 8,
      colorBgContainer: '#FFFFFF',
      fontSize: 14,
      rowHoverBg: 'rgba(0, 185, 107, 0.05)',
      headerBg: 'rgba(0, 185, 107, 0.03)',
      headerColor: '#00B96B',
    },
    Avatar: {
      borderRadius: '50%',
      containerSize: 32,
    }
  },
};

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
        theme={{
          ...themeConfig,
          algorithm: theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
} 