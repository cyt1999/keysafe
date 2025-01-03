# KeySafe 项目结构

## 技术栈

- **框架**: Next.js (React)
- **样式**: TailwindCSS
- **数据库**: PostgreSQL (Prisma ORM)
- **状态管理**: Zustand
- **Web3**: Ethereum (MetaMask)
- **存储**: IPFS (Pinata)

## 目录结构

```
keysafe/
├── public/                 # 静态资源目录
│   └── images/            # 图片资源
│
├── src/                   # 主项目代码目录
│   ├── components/        # 组件目录
│   │   ├── common/        # 通用UI组件
│   │   ├── layout/       # 布局组件
│   │   └── specific/     # 业务组件
│   │       ├── auth/     # 认证相关组件
│   │       └── password/ # 密码管理组件
│   │
│   ├── hooks/            # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   └── usePasswordManager.ts
│   │
│   ├── lib/             # 工具库
│   │   ├── crypto/      # 加密相关
│   │   ├── ipfs/        # IPFS 存储
│   │   └── ethereum/    # Web3 相关
│   │
│   ├── pages/           # 页面路由
│   │   ├── api/         # API 路由
│   │   ├── _app.tsx
│   │   └── index.tsx
│   │
│   ├── services/        # 数据服务
│   │   ├── auth/        # 认证服务
│   │   ├── sync/        # 同步服务
│   │   └── password/    # 密码管理服务
│   │
│   ├── store/          # 状态管理
│   │   ├── auth/       # 认证状态
│   │   └── password/   # 密码管理状态
│   │
│   ├── styles/         # 样式文件
│   │   ├── globals.css # 全局样式
│   │   └── components/ # 组件样式
│   │
│   ├── types/          # 类型定义
│   │   ├── api.d.ts
│   │   └── common.d.ts
│   │
│   ├── utils/          # 工具函数
│   │   ├── format.ts   # 格式化
│   │   └── validation.ts # 验证
│   │
│   └── config/         # 配置文件
│       └── constants.ts # 常量配置
│
├── prisma/             # Prisma 配置
│   └── schema.prisma   # 数据库模型
│
├── docs/              # 项目文档
│   ├── ui-design-guide.md    # UI 设计指南
│   ├── development-guide.md  # 开发指南
│   └── project-structure.md  # 项目结构说明
│
├── chrome-extension/   # Chrome 扩展
│
├── .env.local         # 本地环境变量
├── .env.production    # 生产环境变量
├── next.config.ts     # Next.js 配置
├── tailwind.config.ts # Tailwind 配置
├── postcss.config.mjs # PostCSS 配置
├── package.json       # 项目依赖
└── tsconfig.json      # TypeScript 配置
```

## 目录说明

### 1. 核心目录

#### src/
主要的应用代码目录，包含所有的源代码文件。

#### components/
- **common/**: 通用 UI 组件，如按钮、输入框等
- **layout/**: 页面布局组件，如导航栏、页脚等
- **specific/**: 业务相关组件，如密码管理、认证等

#### services/
- **auth/**: 认证相关服务
- **sync/**: IPFS 同步服务
- **password/**: 密码管理服务

#### lib/
- **crypto/**: 加密解密相关功能
- **ipfs/**: IPFS 存储接口
- **ethereum/**: Web3 钱包集成

### 2. 配置目录

#### prisma/
数据库模型和迁移配置

#### chrome-extension/
Chrome 浏览器扩展相关代码

#### docs/
项目文档，包含设计指南、开发指南等

### 3. 配置文件

- **next.config.ts**: Next.js 框架配置
- **tailwind.config.ts**: TailwindCSS 样式配置
- **postcss.config.mjs**: PostCSS 配置
- **.env.local**: 本地开发环境变量
- **.env.production**: 生产环境变量

## 开发规范

1. **组件开发**
   - 使用 TypeScript
   - 遵循函数式组件
   - 使用 Hooks 管理状态

2. **样式管理**
   - 优先使用 TailwindCSS
   - 复杂样式使用 CSS Modules

3. **状态管理**
   - 使用 Zustand 管理全局状态
   - 本地状态使用 React Hooks

4. **类型定义**
   - 所有组件和函数都要有类型定义
   - 使用 interface 而不是 type
   - 导出所有公共类型 