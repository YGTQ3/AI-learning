# Supabase 设置指南

本指南将帮助您配置 Supabase 数据库以支持社交学习框架的所有功能。

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新账户或登录现有账户
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - 项目名称：`social-learning-framework`
   - 数据库密码：设置强密码
   - 地区：选择离您最近的地区

## 2. 获取项目配置

项目创建完成后，在项目设置中获取：

- **Project URL**: `https://your-project-id.supabase.co`
- **API Key (anon public)**: 用于客户端访问

将这些信息添加到 `.env.local` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. 数据库表结构

### 用户相关表

#### profiles 表（用户资料）
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### follows 表（关注关系）
```sql
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);
```

### 社交功能表

#### posts 表（动态）
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'progress', 'resource', 'achievement', 'question', 'discussion', 'poll')),
  attachments JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (visibility = 'public' OR auth.uid() = author_id);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);
```

#### comments 表（评论）
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);
```

#### likes 表（点赞）
```sql
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like content" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike content" ON likes
  FOR DELETE USING (auth.uid() = user_id);
```

### 学习功能表

#### learning_tasks 表（学习任务）
```sql
CREATE TABLE learning_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_time INTEGER, -- 分钟
  actual_time INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  subtasks JSONB DEFAULT '[]',
  reminders JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE learning_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON learning_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks" ON learning_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON learning_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON learning_tasks
  FOR DELETE USING (auth.uid() = user_id);
```

#### learning_resources 表（学习资源）
```sql
CREATE TABLE learning_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'document', 'image', 'link', 'course', 'quiz', 'exercise', 'note')),
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  url TEXT,
  content TEXT,
  thumbnail TEXT,
  duration INTEGER, -- 秒
  file_size INTEGER,
  format TEXT,
  language TEXT DEFAULT 'zh-CN',
  tags TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  ratings_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public resources are viewable by everyone" ON learning_resources
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create resources" ON learning_resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources" ON learning_resources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources" ON learning_resources
  FOR DELETE USING (auth.uid() = user_id);
```

### 通知表

#### notifications 表
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. 创建索引

为了提高查询性能，创建必要的索引：

```sql
-- 用户相关索引
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- 社交功能索引
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_likes_target_id_type ON likes(target_id, target_type);

-- 学习功能索引
CREATE INDEX idx_learning_tasks_user_id ON learning_tasks(user_id);
CREATE INDEX idx_learning_tasks_status ON learning_tasks(status);
CREATE INDEX idx_learning_tasks_due_date ON learning_tasks(due_date);
CREATE INDEX idx_learning_resources_user_id ON learning_resources(user_id);
CREATE INDEX idx_learning_resources_public ON learning_resources(is_public);
CREATE INDEX idx_learning_resources_category ON learning_resources(category);

-- 通知索引
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

## 5. 创建函数和触发器

### 自动更新 updated_at 字段
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_tasks_updated_at BEFORE UPDATE ON learning_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON learning_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 自动创建用户资料
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 6. 配置存储桶

如果需要文件上传功能，创建存储桶：

1. 在 Supabase 控制台中，转到 "Storage"
2. 创建新桶：
   - 名称：`avatars`（用户头像）
   - 公开：是
   - 文件大小限制：5MB
   - 允许的MIME类型：`image/*`

3. 创建另一个桶：
   - 名称：`attachments`（附件）
   - 公开：否
   - 文件大小限制：50MB

## 7. 配置认证

在 Supabase 控制台的 Authentication > Settings 中：

1. **Site URL**: `http://localhost:3000`（开发环境）
2. **Redirect URLs**: 
   - `http://localhost:3000`
   - `https://your-domain.com`（生产环境）

3. **Email Templates**: 自定义邮件模板
4. **Providers**: 启用需要的第三方登录

## 8. 实时订阅

启用实时功能：

```sql
-- 为需要实时更新的表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## 9. 测试连接

创建一个简单的测试文件验证连接：

```typescript
// test-connection.ts
import { supabase } from './src/lib/supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .single();
    
    if (error) {
      console.error('连接失败:', error);
    } else {
      console.log('连接成功!', data);
    }
  } catch (err) {
    console.error('测试失败:', err);
  }
}

testConnection();
```

## 故障排除

### 常见问题

1. **RLS 策略问题**: 确保为每个表正确设置了行级安全策略
2. **权限问题**: 检查用户是否有正确的权限访问表
3. **连接问题**: 验证 URL 和 API 密钥是否正确

### 调试技巧

1. 在 Supabase 控制台中使用 SQL 编辑器测试查询
2. 检查浏览器开发者工具中的网络请求
3. 查看 Supabase 日志了解错误详情

完成以上设置后，您的 Supabase 数据库就可以支持社交学习框架的所有功能了！
