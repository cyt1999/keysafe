This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# KeySafe

一个安全、便捷的密码管理工具。

## UI 设计

### 设计理念
KeySafe 采用了现代简约的设计风格，注重用户体验和视觉美感。整体使用清新的绿色作为主色调，搭配柔和的阴影和过渡效果，创造出既专业又友好的界面氛围。

### 色彩系统
- **主色调**: 采用清新的品牌绿色（#00B96B），传达安全和可靠的感觉
- **文字色**: 使用深浅不同的灰度，确保良好的可读性
- **背景色**: 选用柔和的白色和浅灰色，减少视觉疲劳
- **状态色**: 包含悬停、激活等状态的颜色变化，提供清晰的交互反馈

### 布局设计
- **顶部导航**: 固定在页面顶部，包含品牌标识和用户信息
- **内容区域**: 采用居中布局，最大宽度 1200px，确保在各种屏幕尺寸下的最佳阅读体验
- **响应式设计**: 适配不同设备的显示需求

### 组件样式
1. **Logo设计**
   - 结合像素风格的钥匙图形与优雅的品牌文字
   - 使用 Playfair Display 字体，增添艺术感
   - 添加细微的装饰效果，提升精致度

2. **按钮系统**
   - 主按钮：使用品牌绿色，突出重要操作
   - 次要按钮：使用浅色背景，保持视觉层级
   - 统一的圆角和过渡动画

3. **表单控件**
   - 输入框：简洁的边框设计，清晰的聚焦状态
   - 搜索框：集成搜索图标，优化的间距
   - 统一的尺寸系统和交互反馈

4. **用户信息展示**
   - 钱包地址：简洁的标签式设计，可点击交互
   - 头像：自动生成的像素风格头像，增添趣味性
   - 精心设计的悬停效果

### 交互设计
- **即时反馈**: 所有可交互元素都有明确的视觉反馈
- **平滑过渡**: 使用精心调校的动画效果
- **状态提示**: 清晰的加载、成功、错误等状态展示

### 设计规范
1. **间距系统**
   - 采用 4px 的基础单位
   - 从 4px 到 32px 的递进间距
   - 确保界面布局的一致性

2. **字体系统**
   - 主文字：系统默认字体，优化显示效果
   - 品牌文字：Playfair Display，用于特殊展示
   - 清晰的字体层级（12px - 24px）

3. **阴影效果**
   - 三个层级的阴影系统
   - 用于创造界面层次感
   - 统一使用品牌色阴影，提升质感

4. **圆角规范**
   - 从 8px 到 24px 的圆角系统
   - 根据组件大小选择合适的圆角值
   - 保持视觉的连贯性

### 可访问性
- 符合 WCAG 2.1 标准的颜色对比度
- 清晰的焦点状态指示
- 适当的字体大小和行高

### 性能优化
- 优化的 CSS 变量系统
- 合理的选择器优先级
- 最小化的样式覆盖


```
keysafe/
├── public/                 # 静态资源目录
│   ├── images/            # 图片资源
│   └── favicon.ico        # 网站图标
│
├── src/                   # 主项目代码目录
│   ├── components/        # 组件目录
│   │   ├── common/        # 通用UI组件
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── AntdRegistry.tsx
│   │   ├── layout/       # 布局组件
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── AppLayout/
│   │   └── specific/     # 业务组件
│   │       ├── auth/     # 认证相关组件
│   │       │   ├── CreatePassword/
│   │       │   ├── VerifyPassword/
│   │       │   └── ConnectWallet/
│   │       └── password/ # 密码管理组件
│   │           ├── PasswordList/
│   │           ├── PasswordForm/
│   │           └── PasswordManager/
│   │
│   ├── hooks/            # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   └── usePasswordManager.ts
│   │
│   ├── lib/             # 工具库
│   │   ├── crypto/
│   │   ├── ipfs/
│   │   └── ethereum/
│   │
│   ├── pages/           # 页面路由
│   │   ├── api/         # API路由
│   │   │   ├── auth/
│   │   │   ├── passwords/
│   │   │   └── admin/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── index.tsx
│   │   ├── dashboard/
│   │   └── auth/
│   │
│   ├── services/        # 数据服务
│   │   ├── auth/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   └── password/
│   │       ├── index.ts
│   │       └── types.ts
│   │
│   ├── store/          # 状态管理
│   │   ├── auth/
│   │   │   ├── slice.ts
│   │   │   └── types.ts
│   │   └── password/
│   │       ├── slice.ts
│   │       └── types.ts
│   │
│   ├── styles/         # 样式文件
│   │   ├── globals.css
│   │   ├── variables.scss
│   │   └── components/
│   │       ├── auth.module.css
│   │       └── password.module.css
│   │
│   ├── types/          # 类型定义
│   │   ├── api.d.ts
│   │   ├── auth.d.ts
│   │   └── password.d.ts
│   │
│   ├── utils/          # 工具函数
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── storage.ts
│   │
│   └── config/         # 配置文件
│       ├── constants.ts
│       └── networks.ts
│
├── prisma/             # Prisma配置
│   └── schema.prisma
│
├── .env.local          # 环境变量
├── .eslintrc.js       # ESLint配置
├── .prettierrc        # Prettier配置
├── next.config.js     # Next.js配置
├── package.json       # 项目依赖
└── tsconfig.json      # TypeScript配置
```


目录详解
1. public/
- 用于存放静态资源（如图片、字体、favicon）。
- 静态文件可通过 /filename 直接访问。
2. src/
- 核心项目目录，便于和外部配置文件区分。
3. components/
- common/: 放置全局通用的UI组件（如按钮、表单）。
- layout/: 包含布局组件，如导航栏、页脚。
- specific/: 放置业务功能相关的组件。
4. hooks/
- 自定义React Hooks，比如 useAuth、useFetch。
5. lib/
- 用于封装与项目业务无关的工具或库，比如格式化函数、第三方API调用等。
6. pages/
- Next.js约定的页面目录，自动生成路由。
- api/: 用于编写API路由，适合简单的后端逻辑。
- _app.tsx: 自定义全局入口，适合引入全局样式或状态管理。
_document.tsx: 自定义HTML模板，适合引入全局meta信息。
7. services/
用于管理与后端的交互逻辑。
可以按功能模块划分文件，例如 authService.ts。
8. store/
- 如果使用状态管理工具（如Redux或Zustand），在此组织状态逻辑。
- 可按模块划分，例如 authSlice.ts。
9. styles/
- 管理全局和局部样式：
- - globals.css: 定义全局样式。
- - 使用CSS Modules时，按组件划分样式文件。
10. types/
- 定义全局TypeScript类型和接口，保持类型清晰。
11. utils/
- 集中存放工具函数，按功能模块划分。
12. config/
- 管理项目的全局配置和常量。


我主要有三个页面  
欢迎 - 用来连接钱包（
主密码验证&创建页面  - 验证主密码  
内容主页 - 内容主页，需要展示所有内容，并且可以进行添加、删除、编辑、搜索等操作  

连接钱包之后，在会话中记录地址信息，而后跳转到主密码验证&创建页面，判断数据库中是否存在该地址，如果存在进行主密码验证，不存在的话，进行主密码创建。然后使用方法，生成数据加密密钥，保存在浏览器中。


所以会涉及到
钱包地址浏览器存储
数据加密密钥浏览器存储

当钱包地址不存在，数据加密密钥不存在时，进入到欢迎页面，连接钱包地址。
当钱包地址存在，数据加密密钥不存在时，进行主密码验证&创建页面，进行主密码验证&创建。
当钱包地址存在，数据加密密钥存在时，进行内容主页的展示。

关于会话的清除有下面3个逻辑
1、设置一个过期时间，自动清除数据加密密钥不包括钱包地址。
2、手动清除数据加密密钥。（锁定按钮）
3、清除钱包地址和数据加密密钥。（断开连接）