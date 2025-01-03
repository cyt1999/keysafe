# KeySafe 项目开发指南

## 项目概述

KeySafe 是一个现代化的密码管理工具，使用 Next.js + TypeScript + Ant Design + TailwindCSS 开发，支持区块链钱包登录和 IPFS 存储。本指南旨在帮助开发者快速理解项目结构并开始开发。

## 技术栈

- **框架**: Next.js 15.1.1
- **语言**: TypeScript 5.0+
- **UI 框架**: Ant Design 5.x + TailwindCSS
- **状态管理**: Zustand
- **样式方案**: TailwindCSS + CSS Modules + Ant Design 主题
- **构建工具**: Turbopack
- **数据库**: PostgreSQL + Prisma
- **Web3**: ethers.js + Pinata SDK
- **包管理**: npm

## 目录结构

```
keysafe/
├── src/
│   ├── components/       # React 组件
│   │   ├── common/      # 通用组件
│   │   ├── layout/      # 布局组件
│   │   └── specific/    # 特定功能组件
│   │       ├── auth/    # 认证相关组件
│   │       └── password/# 密码管理组件
│   ├── config/          # 配置文件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/            # 工具库
│   │   ├── crypto/     # 加密相关
│   │   ├── ipfs/       # IPFS 相关
│   │   └── ethereum/   # 区块链相关
│   ├── pages/          # 页面路由
│   ├── services/       # 服务层
│   │   ├── auth/       # 认证服务
│   │   ├── sync/       # 同步服务
│   │   └── password/   # 密码管理服务
│   ├── store/          # Zustand 状态管理
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
export function PasswordList() {
  return <div>...</div>;
}

// ❌ 不推荐
export default function passwordList() {
  return <div>...</div>;
}
```

### 2. 样式开发规范

#### 2.1 样式文件组织

```
styles/
├── globals.css        # 全局样式
├── components/        # 组件样式
│   ├── auth/         # 认证相关样式
│   └── password/     # 密码管理样式
└── layout/           # 布局样式
```

#### 2.2 样式使用规范

```typescript
// Ant Design 组件
import { Button, Input } from 'antd';

// TailwindCSS + Ant Design 组合使用
<Button 
  type="primary"
  className="flex items-center gap-2 hover:opacity-90"
>
  <PlusOutlined /> 添加密码
</Button>

// 自定义组件样式
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
```

#### 2.3 Ant Design 主题配置

```typescript
// src/components/common/AntdRegistry.tsx
const theme = {
  token: {
    colorPrimary: '#00B96B',
    borderRadius: 8,
    colorSuccess: '#00B96B',
    colorWarning: '#FFB020',
    colorError: '#FF4D4F',
  },
  components: {
    Button: {
      // 按钮相关配置
    },
    Input: {
      // 输入框相关配置
    }
  }
};

// 使用主题
<ConfigProvider theme={theme}>
  <App />
</ConfigProvider>
```

### 3. 状态管理规范

#### 3.1 Zustand Store 组织

```typescript
// store/auth/index.ts
interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // store implementation
}));
```

### 4. Web3 集成规范

#### 4.1 钱包连接

```typescript
// hooks/useWallet.ts
export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  return { address, isConnected, connect };
}
```

#### 4.2 IPFS 存储

```typescript
// services/sync/ipfs/IPFSService.ts
export class IPFSService {
  async uploadData(data: any, userId: string) {
    // 实现数据上传到 IPFS
  }
  
  async downloadData(cid: string) {
    // 实现从 IPFS 下载数据
  }
}
```

### 5. 安全规范

#### 5.1 密码处理

```typescript
// lib/crypto/password.ts
export async function encryptPassword(password: string): Promise<string> {
  // 使用 WebCrypto API 实现加密
}
```

### 6. 环境配置

#### 6.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

#### 6.2 环境变量

必要的环境变量：
```env
# 数据库配置
DATABASE_URL=

# IPFS 配置
PINATA_JWT=
PINATA_GATEWAY_URL=

# 管理员配置
ADMIN_API_KEY=

# 同步配置
IPFS_SYNC_INTERVAL=86400000
SESSION_DURATION=86400000
SYNC_STATUS_INTERVAL=1800000
```

### 7. 代码提交规范

```bash
# 分支命名
feature/password-list
fix/sync-service
docs/api-docs

# 提交信息格式
feat(password): 添加密码列表组件
fix(sync): 修复同步服务异常
docs(guide): 更新开发文档
```

## 设计规范

### 1. 颜色系统

使用 Ant Design 和 TailwindCSS 的组合：
```typescript
// Ant Design 主题色
const theme = {
  token: {
    colorPrimary: '#00B96B',
    colorSuccess: '#00B96B',
    colorWarning: '#FFB020',
    colorError: '#FF4D4F',
  }
};

// TailwindCSS 扩展色
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#00B96B',
        success: '#00B96B',
        warning: '#FFB020',
        error: '#FF4D4F',
        text: '#2C3E50',
      }
    }
  }
};
```

### 2. 布局规范

- 内容最大宽度：1200px
- 页头高度：72px
- 内边距：32px
- 组件间距：24px

### 3. 响应式设计

使用 TailwindCSS 的响应式类：
```html
<div class="w-full md:w-1/2 lg:w-1/3">
```

## 最佳实践

1. 组件设计
   - 保持组件的单一职责
   - 使用 TypeScript 类型约束
   - 实现必要的性能优化

2. 状态管理
   - 合理使用 Zustand
   - 及时清理副作用
   - 避免过度的状态提升

3. 安全性
   - 使用加密存储敏感数据
   - 实现钱包签名验证
   - 做好错误处理

## 更新记录

- 2024-01-03: 更新技术栈说明，添加 Ant Design 相关配置
- 2023-12-31: 更新目录结构
- 2023-12-30: 添加 IPFS 同步服务说明
- 2023-12-29: 更新样式开发规范

## 相关文档

- [产品说明](product-guide.md)
- [技术架构](technical-architecture.md)
- [UI 设计指南](ui-design-guide.md) 