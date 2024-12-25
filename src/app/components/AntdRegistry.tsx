'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';
import { useServerInsertedHTML } from 'next/navigation';
import '../styles/layout.css';

const themeConfig = {
  token: {
    colorPrimary: '#00B96B',
    colorSuccess: '#00B96B',
    colorWarning: '#FFB020',
    colorError: '#FF4D4F',
    colorInfo: '#00B96B',
    colorTextBase: '#2C3E50',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    borderRadius: 12,
    colorBgLayout: '#FCFCFC',
    colorBorder: 'rgba(0, 185, 107, 0.15)',
    boxShadowSecondary: '0 12px 24px rgba(0, 185, 107, 0.08)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    colorLink: '#00B96B',
    colorLinkHover: '#00D6A2',
    colorLinkActive: '#00A15C',
    colorBgMask: 'rgba(0, 185, 107, 0.45)',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      headerHeight: 72,
      headerPadding: '0 32px',
      bodyBg: '#FCFCFC',
    },
    Button: {
      algorithm: true,
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 48,
      controlHeightSM: 36,
      paddingContentHorizontal: 24,
      colorPrimary: '#00B96B',
      colorPrimaryHover: '#00D6A2',
      colorPrimaryActive: '#00A15C',
      defaultBg: 'rgba(0, 185, 107, 0.05)',
      defaultBorderColor: 'rgba(0, 185, 107, 0.15)',
      defaultColor: '#00854D',
      defaultHoverBg: 'rgba(0, 185, 107, 0.08)',
      defaultHoverBorderColor: '#00B96B',
      defaultHoverColor: '#00B96B',
    },
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 48,
      controlHeightSM: 36,
      paddingInline: 16,
      colorBorder: 'rgba(0, 185, 107, 0.15)',
      colorPrimaryHover: '#00B96B',
      activeShadow: '0 0 0 3px rgba(0, 185, 107, 0.1)',
      hoverBg: '#FFFFFF',
      activeBg: '#FFFFFF',
    },
    Select: {
      colorBgContainer: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 48,
      controlHeightSM: 36,
      colorBorder: 'rgba(0, 185, 107, 0.15)',
      colorPrimary: '#00B96B',
      colorPrimaryHover: '#00D6A2',
      activeShadow: '0 0 0 3px rgba(0, 185, 107, 0.1)',
    },
    Modal: {
      borderRadiusLG: 24,
      paddingContentHorizontalLG: 32,
      paddingMD: 32,
      headerBg: 'transparent',
      titleFontSize: 20,
      titleLineHeight: 1.4,
      colorIcon: '#00B96B',
      colorIconHover: '#00D6A2',
      contentBg: 'rgba(255, 255, 255, 0.98)',
      boxShadow: '0 32px 64px rgba(0, 185, 107, 0.12)',
      headerPadding: '0 0 24px 0',
      footerPadding: '24px 0 0 0',
      titleColor: '#00854D',
    },
    Card: {
      borderRadiusLG: 24,
      boxShadowTertiary: '0 20px 40px rgba(0, 185, 107, 0.08)',
      paddingLG: 32,
      colorBorderSecondary: 'rgba(0, 185, 107, 0.08)',
      colorBgContainer: 'rgba(255, 255, 255, 0.98)',
    },
    Table: {
      borderRadius: 16,
      colorBgContainer: 'transparent',
      fontSize: 14,
      rowHoverBg: 'rgba(0, 185, 107, 0.04)',
      headerBg: 'rgba(0, 185, 107, 0.04)',
      headerColor: '#00854D',
      headerFontSize: 14,
      headerLineHeight: 1.5,
      rowPaddingVertical: 16,
      cellPaddingInline: 24,
      borderColor: 'rgba(0, 185, 107, 0.06)',
      headerBorderRadius: 12,
    },
    Avatar: {
      borderRadius: 12,
      containerSize: 40,
      containerSizeLG: 48,
      containerSizeSM: 32,
      fontSizeLG: 16,
      colorBgContainer: 'linear-gradient(135deg, #00B96B 0%, #00D6A2 100%)',
      color: '#FFFFFF',
    },
    Tag: {
      borderRadius: 8,
      paddingXS: 12,
      fontSize: 14,
      lineHeight: 1.5,
      defaultBg: 'rgba(0, 185, 107, 0.08)',
      defaultColor: '#00854D',
      successBg: 'rgba(0, 185, 107, 0.1)',
      successColor: '#00B96B',
      successBorderColor: 'rgba(0, 185, 107, 0.2)',
      fontWeight: 500,
      margin: 0,
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