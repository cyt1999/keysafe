import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AntdRegistry from './components/AntdRegistry';
import { initializeServices } from '@/services/init';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeySafe",
  description: "KeySafe 是一个去中心化的密码管理工具，帮助您安全地管理所有密码。",
};

// 初始化服务
initializeServices();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={geist.className}>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}
