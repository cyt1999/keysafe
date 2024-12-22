import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AntdRegistry from './components/AntdRegistry';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeySafe",
  description: "KeySafe 是一个去中心化的密码管理工具，帮助您安全地管理所有密码。",
};

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
