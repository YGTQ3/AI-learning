# 快速开始指南

## 环境要求

- Node.js 18.0.0 或更高版本
- pnpm 8.0.0 或更高版本
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/your-org/social-learning-framework.git
cd social-learning-framework
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量：

```env
# Supabase配置（必需）
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 其他配置根据需要修改
VITE_APP_NAME=我的学习平台
```

### 4. 数据库设置

参考 [Supabase设置指南](./supabase-setup.md) 配置数据库。

### 5. 启动开发服务器

```bash
pnpm dev
```

应用将在 http://localhost:3000 启动。

## 项目结构

```
social-framework/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── auth/           # 认证组件
│   │   ├── social/         # 社交组件
│   │   ├── learning/       # 学习组件
│   │   ├── common/         # 通用组件
│   │   └── layout/         # 布局组件
│   ├── contexts/           # React Context
│   ├── services/           # API服务
│   ├── types/              # TypeScript类型
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 工具函数
│   ├── pages/              # 页面组件
│   └── lib/                # 第三方库配置
├── docs/                   # 文档
├── tests/                  # 测试文件
└── deployment/             # 部署配置
```

## 核心概念

### 1. 认证系统

框架使用 Supabase Auth 提供完整的用户认证功能：

- 邮箱/密码注册登录
- 第三方登录（Google、GitHub等）
- 邮箱验证
- 密码重置
- 用户资料管理

### 2. 社交功能

提供丰富的社交互动功能：

- 动态发布（文本、图片、视频）
- 评论和回复系统
- 点赞和收藏
- 用户关注
- 话题标签
- 私信功能

### 3. 学习管理

专为学习场景设计的功能：

- 学习任务管理
- 学习资源库
- 学习计划制定
- 进度跟踪
- 成就系统
- 学习统计

### 4. 实时功能

基于 Supabase Realtime 的实时功能：

- 实时消息通知
- 动态实时更新
- 在线状态显示
- 实时协作

## 基础使用

### 1. 用户注册

```typescript
import { useAuth } from '@/contexts/AuthContext';

function RegisterForm() {
  const { register } = useAuth();
  
  const handleSubmit = async (data) => {
    const result = await register({
      email: data.email,
      password: data.password,
      username: data.username
    });
    
    if (result.success) {
      // 注册成功
    }
  };
}
```

### 2. 发布动态

```typescript
import { useSocial } from '@/contexts/SocialContext';

function CreatePost() {
  const { createPost } = useSocial();
  
  const handlePost = async () => {
    const success = await createPost({
      content: '今天学习了React Hooks！',
      type: 'progress',
      tags: ['React', '前端开发']
    });
    
    if (success) {
      // 发布成功
    }
  };
}
```

### 3. 创建学习任务

```typescript
import { useLearning } from '@/contexts/LearningContext';

function CreateTask() {
  const { createTask } = useLearning();
  
  const handleCreate = async () => {
    const success = await createTask({
      title: '学习TypeScript基础',
      subject: '编程',
      difficulty: 'medium',
      estimatedTime: 120 // 分钟
    });
  };
}
```

## 自定义配置

### 1. 主题配置

框架支持自定义主题：

```typescript
// src/lib/theme.ts
export const customTheme = {
  colors: {
    primary: '#your-primary-color',
    secondary: '#your-secondary-color'
  },
  fonts: {
    sans: 'Your Font Family'
  }
};
```

### 2. 功能开关

通过环境变量控制功能：

```env
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REALTIME=true
```

### 3. API配置

自定义API端点：

```typescript
// src/lib/config.ts
export const apiConfig = {
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 30000,
  retries: 3
};
```

## 下一步

- 阅读 [API文档](./api-reference.md)
- 查看 [组件文档](./components.md)
- 了解 [部署指南](./deployment.md)
- 参考 [最佳实践](./best-practices.md)

## 获取帮助

- 查看 [常见问题](./faq.md)
- 提交 [Issue](https://github.com/your-org/social-learning-framework/issues)
- 加入 [讨论社区](https://github.com/your-org/social-learning-framework/discussions)
