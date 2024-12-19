import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@ant-design/icons', 'antd', '@ant-design/cssinjs'],
  images: {
    // 配置允许加载网络logo的域名
    domains: ['cryptologos.cc'],
  },
  // 添加样式优化配置
  compiler: {
    styledComponents: true, // 启用 styled-components 优化
  },
  experimental: {
    optimizeCss: true, // 启用 CSS 优化
  },
};

export default nextConfig;
