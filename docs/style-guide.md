# KeySafe 样式指南

## 1. 样式架构

项目采用分层的样式管理方案，结合 Ant Design 组件库和自定义样式：

```
src/styles/
├── index.css              # 样式入口文件
├── globals.css           # 全局样式
├── base/                 # 基础样式
│   ├── variables.css    # 变量定义
│   └── reset.css       # 样式重置
├── layout/              # 布局样式
│   ├── header.css     # 头部样式
│   └── content.css    # 内容区样式
└── components/         # 组件样式
    ├── button.css     # 按钮样式
    ├── modal.css      # 模态框样式
    ├── table.css      # 表格样式
    ├── tag.css        # 标签样式
    ├── avatar.css     # 头像样式
    ├── dropdown.css   # 下拉菜单样式
    └── password/      # 密码管理相关样式
        ├── PasswordForm.css
        └── PasswordList.css
```

## 2. 样式加载顺序

样式按照以下顺序加载，确保正确的样式覆盖：

1. **Ant Design 基础样式**
   ```typescript
   import 'antd/dist/reset.css';
   ```

2. **自定义全局样式**
   ```typescript
   import '@/styles/index.css';
   ```

## 3. Ant Design 主题定制

### 3.1 颜色系统

```typescript
const theme = {
  token: {
    colorPrimary: '#00B96B',    // 主色调
    colorSuccess: '#00B96B',    // 成功色
    colorWarning: '#FFB020',    // 警告色
    colorError: '#FF4D4F',      // 错误色
  }
};
```

### 3.2 组件样式覆盖

```css
/* 在组件样式文件中覆盖 Ant Design 默认样式 */
.ant-btn-primary {
  background-color: var(--primary-color);
}
```

## 4. CSS 编写规范

### 4.1 命名规范（BEM）

```css
/* Block */
.password-form { }

/* Element */
.password-form__input { }

/* Modifier */
.password-form__button--primary { }
```

### 4.2 CSS 变量

```css
:root {
  /* 颜色 */
  --primary-color: #00B96B;
  --text-color: #2C3E50;
  
  /* 间距 */
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --spacing-large: 24px;
  
  /* 圆角 */
  --border-radius: 8px;
}
```

### 4.3 响应式设计

```css
/* 移动端优先 */
.container {
  padding: var(--spacing-small);
}

/* 平板 (≥768px) */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-medium);
  }
}

/* 桌面端 (≥1024px) */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-large);
  }
}
```

## 5. 布局规范

### 5.1 网格系统

- 最大内容宽度：1200px
- 列间距：24px
- 内边距：
  - 移动端：16px
  - 桌面端：24px

### 5.2 组件间距

```css
/* 组件垂直间距 */
.component-wrapper + .component-wrapper {
  margin-top: var(--spacing-large);
}

/* 表单项间距 */
.form-item + .form-item {
  margin-top: var(--spacing-medium);
}
```

## 6. 最佳实践

### 6.1 样式隔离

- 使用 BEM 命名避免样式冲突
- 组件样式文件独立管理
- 避免使用全局选择器

### 6.2 性能优化

- 避免深层嵌套选择器
- 合理使用继承和复用
- 优化选择器性能

### 6.3 维护建议

- 定期清理未使用的样式
- 保持样式文件结构清晰
- 及时更新样式文档
- 遵循代码审查流程

### 6.4 调试技巧

- 使用浏览器开发工具
- 检查样式覆盖情况
- 验证响应式布局
- 使用 CSS Grid 调试工具

## 7. 辅助工具

### 7.1 开发工具

- Chrome DevTools
- VS Code 插件：
  - CSS Peek
  - CSS Modules
  - StyleLint

### 7.2 代码检查

```json
{
  "scripts": {
    "lint:style": "stylelint \"src/**/*.css\"",
    "format:style": "stylelint \"src/**/*.css\" --fix"
  }
}
```

## 8. 更新记录

- 2024-01-03: 更新样式架构，移除 Tailwind 相关配置
- 2023-12-31: 添加 Ant Design 主题配置
- 2023-12-30: 更新响应式设计规范
- 2023-12-29: 初始版本 
