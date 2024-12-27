# KeySafe 项目开发指南

## 项目概述

KeySafe 是一个现代化的密码管理工具，使用 Next.js + TypeScript + Ant Design 开发，支持区块链钱包登录和 IPFS 存储。本指南旨在帮助开发者快速理解项目结构并开始开发。

## 技术栈

- **框架**: Next.js 15.1.1 (Pages Router)
- **语言**: TypeScript 5.0+
- **UI 框架**: Ant Design 5.22.5
- **状态管理**: Redux Toolkit + React Redux
- **样式方案**: CSS Variables + Tailwind CSS
- **构建工具**: Turbopack
- **数据库**: Prisma
- **Web3**: ethers.js + Pinata Web3
- **包管理**: npm

## 目录结构

```
keysafe/
├── src/
│   ├── components/       # React 组件
│   │   ├── common/      # 通用组件
│   │   ├── layout/      # 布局组件
│   │   └── specific/    # 特定功能组件
│   ├── config/          # 配置文件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/            # 工具库
│   │   ├── crypto/     # 加密相关
│   │   ├── ipfs/       # IPFS 相关
│   │   └── ethereum/   # 区块链相关
│   ├── pages/          # 页面路由
│   ├── services/       # 服务层
│   ├── store/          # Redux 状态管理
│   ├── styles/         # 样式文件
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── prisma/             # Prisma 配置
└── public/             # 静态资源
```

## 开发规范

### 1. 组件开发规范

#### 1.1 组件分类

- **通用组件**: `components/common` - 基础 UI 组件
- **布局组件**: `components/layout` - 页面布局组件
- **业务组件**: `components/specific` - 特定功能组件

#### 1.2 组件命名和导出

```typescript
// ✅ 推荐
export function PasswordGenerator() {
  return <div>...</div>;
}

// ❌ 不推荐
export default function passwordGenerator() {
  return <div>...</div>;
}
```

### 2. 样式开发规范

#### 2.1 样式文件组织

```
styles/
├── base/              # 基础样式
│   ├── variables.css  # 全局变量
│   └── reset.css      # 重置样式
├── components/        # 组件样式
│   ├── button.css
│   ├── input.css
│   └── password/     # 功能模块样式
└── layout/           # 布局样式
```

#### 2.2 主题配置

```typescript
// AntdRegistry.tsx
const themeConfig = {
  token: {
    colorPrimary: '#00B96B',
    colorSuccess: '#00B96B',
    borderRadius: 12,
    // ... 其他主题配置
  }
};
```

### 3. 状态管理规范

#### 3.1 Redux Store 组织

```typescript
store/
├── auth/             # 认证相关状态
│   ├── slice.ts
│   └── types.ts
└── password/         # 密码相关状态
    ├── slice.ts
    └── types.ts
```

#### 3.2 API 服务封装

```typescript
// services/password/index.ts
export interface PasswordService {
  create(params: CreatePasswordParams): Promise<ApiResponse<Password>>;
  update(params: UpdatePasswordParams): Promise<ApiResponse<Password>>;
}
```

### 4. Web3 集成规范

#### 4.1 钱包连接

```typescript
// hooks/useWallet.ts
export function useWallet() {
  return {
    isConnected,
    address,
    network,
    provider,
    connect,
    disconnect
  };
}
```

#### 4.2 IPFS 存储

```typescript
// 使用 Pinata Web3 SDK
interface PinataOptions {
  pinataMetadata?: PinataMetadata;
}
```

### 5. 安全规范

#### 5.1 密码处理

```typescript
// ✅ 推荐
const encryptedPassword = await encryptPassword(password);

// ❌ 不推荐
localStorage.setItem('password', password);
```

### 6. 环境配置

#### 6.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器（使用 Turbopack）
npm run dev

# 构建生产版本
npm run build
```

#### 6.2 环境变量

必要的环境变量：
- `DATABASE_URL`: Prisma 数据库连接
- `PINATA_JWT`: Pinata API 密钥
- `PINATA_GATEWAY`: Pinata 网关地址

### 7. 代码提交规范

```bash
# 分支命名
feature/password-generator
fix/form-validation
docs/development-guide

# 提交信息格式
feat(password): 添加密码生成功能
fix(ui): 修复表单提交按钮样式
docs(guide): 更新开发文档
```

## 设计规范

### 1. 颜色系统

- 主色：`#00B96B`
- 成功：`#00B96B`
- 警告：`#FFB020`
- 错误：`#FF4D4F`
- 文本：`#2C3E50`

### 2. 布局规范

- 内容最大宽度：1200px
- 页头高度：72px
- 内边距：32px
- 组件间距：24px

### 3. 响应式设计

```css
/* 移动端优先 */
.container {
  width: 100%;
  
  @media (min-width: 768px) {
    width: 50%;
  }
}
```

## 最佳实践

1. 组件设计
   - 保持组件的单一职责
   - 使用 TypeScript 类型约束
   - 实现必要的性能优化

2. 状态管理
   - 合理使用 Redux
   - 及时清理副作用
   - 避免过度的状态提升

3. 安全性
   - 使用加密存储敏感数据
   - 实现钱包签名验证
   - 做好错误处理

## 更新记录

- 2023-12-27: 初始版本
- 2023-12-28: 添加 Web3 集成规范
- 2023-12-29: 更新样式开发规范

## 联系方式

- 项目文档：[产品文档.md](./产品文档.md)
- 代码仓库：[GitHub](https://github.com/your-repo/keysafe) 