# KeySafe 项目样式开发指南

## 目录结构

```
src/styles/
├── base/                # 基础样式
│   ├── variables.css    # 全局变量（颜色、间距、字体等）
│   └── reset.css        # 重置样式和全局样式
├── layout/             # 布局相关样式
│   ├── header.css      # 头部布局
│   └── content.css     # 内容区布局
├── components/         # 组件样式
│   ├── button.css      # 按钮基础样式
│   ├── input.css       # 输入框基础样式
│   ├── modal.css       # 模态框基础样式
│   ├── table.css       # 表格基础样式
│   └── password/       # 特定功能模块的样式
│       └── PasswordForm.css  # 密码表单特定样式
└── index.css           # 样式入口文件
```

## 样式规范

### 1. 全局变量使用

所有通用的样式值都定义在 `variables.css` 中，包括：

```css
:root {
  /* 颜色系统 */
  --color-primary: #00B96B;
  --color-primary-hover: #00D6A2;
  
  /* 间距系统 */
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* 字体系统 */
  --font-size-base: 14px;
  --font-weight-medium: 500;
  
  /* 圆角系统 */
  --radius-md: 12px;
}
```

### 2. 组件样式开发

#### 2.1 基础组件样式

基础组件样式位于 `components/` 目录下，定义通用的组件样式：

```css
/* components/button.css */
.ant-btn {
  transition: var(--transition-base);
  border-radius: var(--radius-md);
  /* 其他基础样式 */
}
```

#### 2.2 功能模块样式

特定功能模块的样式应放在对应的子目录中：

```css
/* components/password/PasswordForm.css */
.password-form {
  /* 组件级变量 */
  --input-height: 40px;
  
  /* 组件样式 */
  width: 100%;
  max-width: 500px;
}
```

### 3. 开发规范

#### 3.1 变量使用原则

```css
/* ❌ 不推荐 */
.component {
  color: #00B96B;
  padding: 16px;
}

/* ✅ 推荐 */
.component {
  color: var(--color-primary);
  padding: var(--spacing-md);
}
```

#### 3.2 组件作用域

```css
/* ✅ 推荐的作用域方式 */
.feature-name {
  --component-spacing: var(--spacing-lg);
}

.feature-name .item {
  margin-bottom: var(--component-spacing);
}
```

### 4. 新功能开发流程

1. **创建样式文件**：
   ```bash
   mkdir -p src/styles/components/feature-name
   touch src/styles/components/feature-name/FeatureName.css
   ```

2. **导入样式**：
   ```css
   /* index.css */
   @import './components/feature-name/FeatureName.css';
   ```

3. **在组件中使用**：
   ```tsx
   import '@/styles/components/feature-name/FeatureName.css';
   
   export function FeatureName() {
     return (
       <div className="feature-name">
         {/* 组件内容 */}
       </div>
     );
   }
   ```

### 5. 样式优先级

- 使用 Stylelint 进行代码检查
- 遵循团队约定的编码规范
- 定期进行代码审查

## 结语

遵循本指南可以帮助我们：

- 保持代码的一致性
- 提高开发效率
- 减少样式冲突
- 便于维护和扩展

- 定期检查未使用的样式
- 保持样式文件的整洁和可维护性
- 及时更新文档 
