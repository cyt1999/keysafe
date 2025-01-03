文档还在持续更新中，目前只关注 README.md 的内容就好。
# KeySafe

一个安全、便捷的密码管理工具。

## 文档导航

- [产品说明](docs/product-guide.md) - 产品愿景、功能与规划
- [技术架构](docs/technical-architecture.md) - 系统架构与技术实现
- [UI 设计指南](docs/ui-design-guide.md) - UI 设计规范和组件说明
- [项目结构说明](docs/project-structure.md) - 项目目录结构和文件说明
- [开发指南](docs/development-guide.md) - 开发环境搭建和项目配置说明

## 功能特点

- 🔒 安全的密码管理
- 🔄 IPFS 分布式存储
- 👛 Web3 钱包集成
- 🎨 现代化的用户界面

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/yourusername/keysafe.git
cd keysafe
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制 `.env.example` 到 `.env.local` 并填写必要的环境变量

4. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 环境变量配置

项目使用了不同的环境配置文件来管理不同环境的设置：

### 开发环境 (.env.local)

用于本地开发时使用，不应提交到版本控制系统。

### 生产环境 (.env.production)

用于生产环境部署，包含以下配置项：

1. **数据库配置**
   ```
   DATABASE_URL="postgresql://[用户名]:[密码]@[主机地址]:[端口]/keysafe?schema=public"
   ```
   - 配置 PostgreSQL 数据库连接信息
   - 请使用强密码和适当的数据库用户权限

2. **IPFS 配置**
   ```
   PINATA_JWT=your_production_pinata_jwt
   PINATA_GATEWAY_URL=your_production_gateway_url
   ```
   - 配置 Pinata IPFS 服务的访问凭证
   - 用于数据同步和备份功能

3. **API 配置**
   ```
   ADMIN_API_KEY=your_production_admin_api_key
   ```
   - 管理员 API 访问密钥
   - 用于特权操作的认证

4. **时间间隔配置**
   ```
   IPFS_SYNC_INTERVAL=86400000    # IPFS 同步间隔（24小时）
   SESSION_DURATION=86400000      # 会话有效期（24小时）
   SYNC_STATUS_INTERVAL=1800000   # 同步状态刷新间隔（30分钟）
   ```
   - 控制各种自动化任务的执行频率
   - 时间单位均为毫秒

5. **环境标识**
   ```
   NODE_ENV=production
   ```
   - 标识当前运行环境

### 环境变量说明

- 所有环境变量在启动应用前必须正确配置
- 生产环境的敏感信息（如密钥、密码等）应妥善保管
- 建议使用环境变量管理系统（如 Docker Secrets、Kubernetes Secrets）来存储敏感信息
- 定期更新密钥和令牌以提高安全性

### 部署注意事项

1. 不要将包含敏感信息的 `.env` 文件提交到版本控制系统
2. 在生产服务器上手动创建和配置环境变量
3. 确保文件权限设置正确（只有必要的用户可以读取）
4. 定期备份数据库和环境配置
5. 监控服务器日志以检测异常访问