import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@ant-design/icons', 'antd', '@ant-design/cssinjs'],
};

export default nextConfig;
