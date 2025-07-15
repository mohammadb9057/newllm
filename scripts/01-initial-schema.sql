-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  api_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_usage INTEGER DEFAULT 0,
  token_limit INTEGER DEFAULT 1000,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE public.agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model_preference TEXT DEFAULT 'gpt-3.5-turbo',
  memory_enabled BOOLEAN DEFAULT TRUE,
  memory_type TEXT DEFAULT 'conversation', -- 'conversation', 'vector', 'none'
  api_integrations JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  title TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Logs table for monitoring
CREATE TABLE public.api_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_body JSONB,
  response_body JSONB,
  response_status INTEGER,
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory entries for agents
CREATE TABLE public.agent_memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  memory_type TEXT DEFAULT 'text', -- 'text', 'vector', 'json'
  embedding vector(1536), -- For vector memories
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration
CREATE TABLE public.system_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO public.system_config (config_key, config_value, description) VALUES
('site_settings', '{
  "site_name": "پلتفرم هوش مصنوعی",
  "site_description": "پلتفرم پیشرفته هوش مصنوعی با قابلیت ساخت ایجنت شخصی",
  "logo_url": "/logo.png",
  "support_email": "support@example.com",
  "default_model": "gpt-3.5-turbo"
}', 'تنظیمات کلی سایت'),
('api_settings', '{
  "proxy_url": "https://api.llm7.io/v1",
  "rate_limit_per_hour": 100,
  "max_tokens_per_request": 4000,
  "allowed_models": []
}', 'تنظیمات API و پراکسی'),
('user_limits', '{
  "default_token_limit": 1000,
  "max_agents_per_user": 10,
  "max_conversations_per_user": 100
}', 'محدودیت‌های کاربران');

-- Create indexes for better performance
CREATE INDEX idx_users_api_token ON public.users(api_token);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX idx_agent_memories_agent_id ON public.agent_memories(agent_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own agents" ON public.agents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from own conversations" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own agent memories" ON public.agent_memories
  FOR ALL USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all" ON public.api_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can manage system config" ON public.system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
