-- Supabase 初始化 SQL 脚本
-- 功能：为 momo 工作台创建数据表、存储桶和 RLS 策略
-- 
-- 执行步骤：
-- 1. 登录 Supabase 控制台
-- 2. 进入你的项目
-- 3. 左侧菜单 → SQL Editor → New Query
-- 4. 粘贴此脚本并执行

-- 1. 创建数据存储表（单表存储所有用户数据，简化同步逻辑）
CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL DEFAULT 'user_default',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建唯一索引以支持 upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data (user_id);

-- 启用 RLS（行级安全）
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：允许匿名/认证用户访问（简化版，单用户场景）
-- 如果未来需要多用户隔离，可以改为只允许 authenticated 用户
CREATE POLICY "Allow all operations for user_default" ON public.user_data
  FOR ALL
  TO anon, authenticated
  USING (user_id = 'user_default')
  WITH CHECK (user_id = 'user_default');

-- 2. 创建用户配置表
CREATE TABLE IF NOT EXISTS public.user_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'user_default',
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for user_config" ON public.user_config
  FOR ALL
  TO anon, authenticated
  USING (user_id = 'user_default')
  WITH CHECK (user_id = 'user_default');

-- 3. 创建触发器：自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_user_data ON public.user_data;
CREATE TRIGGER set_timestamp_user_data
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_user_config ON public.user_config;
CREATE TRIGGER set_timestamp_user_config
  BEFORE UPDATE ON public.user_config
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- 4. 创建存储桶用于囤货图片
-- ⚠️ 注意：存储桶需要在 Dashboard UI 中手动创建（或使用 SQL）
-- 
-- 方法 A（推荐）：在 Dashboard 中手动创建
--   1. 左侧菜单 → Storage → Create a new bucket
--   2. 名称：stock-photos
--   3. 勾选 "Public bucket"（公开访问）
--   4. 创建完成
--
-- 方法 B：用 SQL 创建（运行下面的语句）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('stock-photos', 'stock-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 允许匿名用户上传到 stock-photos 存储桶
CREATE POLICY "Allow anon uploads to stock-photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'stock-photos');

-- 允许公开读取 stock-photos 存储桶的文件
CREATE POLICY "Allow public reads from stock-photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'stock-photos');

-- 允许删除自己上传的文件（简化版，允许删除）
CREATE POLICY "Allow deletions from stock-photos" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'stock-photos');
