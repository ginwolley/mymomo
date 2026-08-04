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

-- 创建 RLS 策略：只允许绑定的登录邮箱访问（推荐，最安全）
-- 即使有人注册 Supabase 账号，也无法访问你的数据
DROP POLICY IF EXISTS "Allow all operations for user_default" ON public.user_data;
CREATE POLICY "Allow owner access user_data" ON public.user_data
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'huangying0404@qq.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'huangying0404@qq.com');

-- 2. 创建用户配置表
CREATE TABLE IF NOT EXISTS public.user_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'user_default',
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for user_config" ON public.user_config;
CREATE POLICY "Allow owner access user_config" ON public.user_config
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'huangying0404@qq.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'huangying0404@qq.com');

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

-- 允许登录用户上传到 stock-photos 存储桶（仅绑定的邮箱账号）
DROP POLICY IF EXISTS "Allow anon uploads to stock-photos" ON storage.objects;
CREATE POLICY "Allow owner uploads to stock-photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'stock-photos' AND auth.jwt() ->> 'email' = 'huangying0404@qq.com');

-- 允许公开读取 stock-photos 存储桶的文件（图片 URL 需要在网页中显示）
CREATE POLICY "Allow public reads from stock-photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'stock-photos');

-- 允许登录用户删除图片（仅绑定的邮箱账号）
DROP POLICY IF EXISTS "Allow deletions from stock-photos" ON storage.objects;
CREATE POLICY "Allow owner deletions from stock-photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'stock-photos' AND auth.jwt() ->> 'email' = 'huangying0404@qq.com');
