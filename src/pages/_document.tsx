import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="KeySafe - 安全、便捷的密码管理工具。使用区块链技术保护您的密码安全，随时随地访问您的密码库。" />
        <meta name="keywords" content="密码管理,区块链,安全,加密,密码库,KeySafe" />
        <meta name="author" content="KeySafe Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="KeySafe - 区块链密码管理工具" />
        <meta property="og:description" content="安全、便捷的密码管理工具。使用区块链技术保护您的密码安全。" />
        <meta property="og:image" content="/favicon.svg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="KeySafe - 区块链密码管理工具" />
        <meta name="twitter:description" content="安全、便捷的密码管理工具。使用区块链技术保护您的密码安全。" />
        <meta name="twitter:image" content="/favicon.svg" />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#00B96B" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}