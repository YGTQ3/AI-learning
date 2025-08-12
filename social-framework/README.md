# AI学习助手社交框架

这是一个基于React + TypeScript + Supabase的现代化社交学习框架，专为教育和学习场景设计。

## 🚀 特性

### 核心功能
- ✅ 用户认证系统（注册/登录/登出）
- ✅ 学习任务管理（创建、编辑、完成、同步）
- ✅ 学习资源管理（分类、收藏、搜索）
- ✅ 社交分享功能（动态发布、评论、点赞）
- ✅ 实时通知系统
- ✅ 云端数据同步

### 社交功能
- 📝 动态发布（学习进度、资源分享、成就展示）
- 💬 评论互动系统
- ❤️ 点赞功能
- 👥 用户关注系统（规划中）
- 💌 私信功能（规划中）
- 🏷️ 话题标签（规划中）
- 🏆 用户等级系统（规划中）

### 技术特性
- 🎨 响应式设计 + 暗色模式
- ⚡ 乐观更新提升用户体验
- 🔄 离线支持和数据同步
- 📱 PWA支持
- 🔒 安全的权限控制
- 🚀 高性能优化

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM v7
- **状态管理**: React Context API
- **UI框架**: Tailwind CSS
- **动画**: Framer Motion
- **通知**: Sonner

### 后端服务
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **实时功能**: Supabase Realtime
- **文件存储**: Supabase Storage

## 📁 项目结构

```
social-framework/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── auth/           # 认证相关组件
│   │   ├── social/         # 社交功能组件
│   │   ├── common/         # 通用组件
│   │   └── layout/         # 布局组件
│   ├── contexts/           # React Context
│   │   ├── AuthContext.tsx
│   │   ├── SocialContext.tsx
│   │   └── NotificationContext.tsx
│   ├── services/           # API服务层
│   │   ├── auth.ts
│   │   ├── social.ts
│   │   └── sync.ts
│   ├── types/              # TypeScript类型定义
│   │   ├── auth.ts
│   │   ├── social.ts
│   │   └── common.ts
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 工具函数
│   ├── pages/              # 页面组件
│   └── lib/                # 第三方库配置
├── docs/                   # 文档
├── tests/                  # 测试文件
└── deployment/             # 部署配置
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+
- Supabase账户

### 安装依赖
```bash
pnpm install
```

### 环境配置
1. 复制 `.env.example` 到 `.env.local`
2. 配置Supabase环境变量
3. 运行数据库迁移

### 启动开发服务器
```bash
pnpm dev
```

## 📖 使用指南

### 基础使用
1. 用户注册/登录
2. 创建学习任务和资源
3. 发布学习动态
4. 与其他用户互动

### 高级功能
- 自定义学习计划
- 社交互动优化
- 数据分析和报告

## 🔧 配置说明

### Supabase配置
详见 `docs/supabase-setup.md`

### 部署配置
详见 `docs/deployment.md`

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

MIT License

## 🆘 支持

如有问题，请提交Issue或联系维护团队。
