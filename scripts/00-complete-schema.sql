-- =====================================================
-- Persian AI SaaS Platform - Complete Database Schema
-- =====================================================

-- Drop all existing objects
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    api_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    tokens_used BIGINT DEFAULT 0 NOT NULL,
    tokens_limit BIGINT DEFAULT 1000 NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- AGENTS TABLE
-- =====================================================
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT,
    model_id TEXT DEFAULT 'gpt-3.5-turbo' NOT NULL,
    memory_type TEXT DEFAULT 'conversation' CHECK (memory_type IN ('none', 'conversation', 'vector', 'hybrid')),
    has_memory BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    settings JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    title TEXT,
    model_id TEXT,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model_id TEXT,
    tokens INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- AGENT MEMORY TABLE
-- =====================================================
CREATE TABLE public.agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    memory_key TEXT NOT NULL,
    memory_value TEXT NOT NULL,
    memory_type TEXT DEFAULT 'text' CHECK (memory_type IN ('text', 'vector', 'json')),
    embedding vector(1536),
    importance_score FLOAT DEFAULT 0.5,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- REQUEST LOGS TABLE
-- =====================================================
CREATE TABLE public.request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'POST' NOT NULL,
    request_body JSONB,
    response_body JSONB,
    response_status INTEGER,
    model_id TEXT,
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- SYSTEM CONFIGURATION TABLE
-- =====================================================
CREATE TABLE public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- API KEYS TABLE (for external integrations)
-- =====================================================
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    permissions JSONB DEFAULT '[]' NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- USAGE ANALYTICS TABLE
-- =====================================================
CREATE TABLE public.usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}' NOT NULL,
    model_id TEXT,
    tokens_consumed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_api_token ON public.users(api_token);
CREATE INDEX idx_users_is_admin ON public.users(is_admin);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Agents indexes
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_is_active ON public.agents(is_active);
CREATE INDEX idx_agents_model_id ON public.agents(model_id);
CREATE INDEX idx_agents_created_at ON public.agents(created_at);

-- Conversations indexes
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);
CREATE INDEX idx_conversations_is_archived ON public.conversations(is_archived);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_role ON public.messages(role);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Agent memory indexes
CREATE INDEX idx_agent_memory_agent_id ON public.agent_memory(agent_id);
CREATE INDEX idx_agent_memory_user_id ON public.agent_memory(user_id);
CREATE INDEX idx_agent_memory_memory_type ON public.agent_memory(memory_type);
CREATE INDEX idx_agent_memory_created_at ON public.agent_memory(created_at);

-- Request logs indexes
CREATE INDEX idx_request_logs_user_id ON public.request_logs(user_id);
CREATE INDEX idx_request_logs_endpoint ON public.request_logs(endpoint);
CREATE INDEX idx_request_logs_created_at ON public.request_logs(created_at);
CREATE INDEX idx_request_logs_model_id ON public.request_logs(model_id);

-- System config indexes
CREATE INDEX idx_system_config_key ON public.system_config(config_key);
CREATE INDEX idx_system_config_is_public ON public.system_config(is_public);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON public.api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON public.api_keys(expires_at);

-- Usage analytics indexes
CREATE INDEX idx_usage_analytics_user_id ON public.usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_event_type ON public.usage_analytics(event_type);
CREATE INDEX idx_usage_analytics_created_at ON public.usage_analytics(created_at);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_memory_updated_at BEFORE UPDATE ON public.agent_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        api_token,
        tokens_used,
        tokens_limit,
        is_admin
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        'llm_' || encode(gen_random_bytes(32), 'hex'),
        0,
        1000,
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.last_login_at IS DISTINCT FROM NEW.last_login_at THEN
        INSERT INTO public.usage_analytics (user_id, event_type, event_data)
        VALUES (NEW.id, 'user_login', jsonb_build_object('timestamp', NEW.last_login_at));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user activity logging
CREATE TRIGGER log_user_activity_trigger
    AFTER UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.log_user_activity();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Agents policies
CREATE POLICY "Users can manage own agents" ON public.agents
    FOR ALL USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can manage own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can access messages from own conversations" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id AND user_id = auth.uid()
        )
    );

-- Agent memory policies
CREATE POLICY "Users can manage own agent memories" ON public.agent_memory
    FOR ALL USING (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can manage own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Admin-only policies
CREATE POLICY "Admins can view all request logs" ON public.request_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can manage system config" ON public.system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Public can view public system config" ON public.system_config
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can view all usage analytics" ON public.usage_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- =====================================================
-- DEFAULT SYSTEM CONFIGURATION
-- =====================================================

INSERT INTO public.system_config (config_key, config_value, description, is_public) VALUES
('site_settings', '{
    "site_name": "پلتفرم هوش مصنوعی",
    "site_description": "پلتفرم پیشرفته هوش مصنوعی با قابلیت ساخت ایجنت شخصی",
    "logo_url": "/logo.png",
    "support_email": "support@example.com",
    "default_model": "gpt-3.5-turbo",
    "maintenance_mode": false
}', 'تنظیمات کلی سایت', true),

('api_settings', '{
    "proxy_url": "https://api.llm7.io/v1",
    "rate_limit_per_hour": 100,
    "max_tokens_per_request": 4000,
    "allowed_models": [
        "gpt-3.5-turbo",
        "gpt-4",
        "claude-3-sonnet",
        "claude-3-haiku"
    ],
    "default_temperature": 0.7,
    "default_max_tokens": 2000
}', 'تنظیمات API و پراکسی', false),

('user_limits', '{
    "default_token_limit": 1000,
    "max_agents_per_user": 10,
    "max_conversations_per_user": 100,
    "max_memory_entries_per_agent": 1000,
    "token_reset_interval": "monthly"
}', 'محدودیت‌های کاربران', false),

('features', '{
    "agent_creation": true,
    "memory_system": true,
    "conversation_history": true,
    "api_access": true,
    "admin_panel": true,
    "analytics": true
}', 'ویژگی‌های فعال سیستم', false);

-- =====================================================
-- CREATE ADMIN USER (Optional - for development)
-- =====================================================

-- This will be handled by the application, but you can uncomment for development
-- INSERT INTO public.users (
--     id,
--     email,
--     name,
--     api_token,
--     tokens_used,
--     tokens_limit,
--     is_admin
-- ) VALUES (
--     uuid_generate_v4(),
--     'admin@example.com',
--     'System Administrator',
--     'llm_' || encode(gen_random_bytes(32), 'hex'),
--     0,
--     10000,
--     true
-- ) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get user by API token
CREATE OR REPLACE FUNCTION public.get_user_by_api_token(token TEXT)
RETURNS public.users AS $$
DECLARE
    user_record public.users;
BEGIN
    SELECT * INTO user_record
    FROM public.users
    WHERE api_token = token AND is_active = true;
    
    RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment user token usage
CREATE OR REPLACE FUNCTION public.increment_user_tokens(user_id UUID, tokens INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.users
    SET tokens_used = tokens_used + tokens,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset user tokens (for monthly reset)
CREATE OR REPLACE FUNCTION public.reset_user_tokens()
RETURNS INTEGER AS $$
DECLARE
    reset_count INTEGER;
BEGIN
    UPDATE public.users
    SET tokens_used = 0,
        updated_at = NOW()
    WHERE tokens_used > 0;
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View for user statistics
CREATE VIEW public.user_stats AS
SELECT
    u.id,
    u.email,
    u.name,
    u.tokens_used,
    u.tokens_limit,
    u.is_admin,
    u.created_at,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(DISTINCT c.id) as conversation_count,
    COUNT(DISTINCT m.id) as message_count
FROM public.users u
LEFT JOIN public.agents a ON u.id = a.user_id AND a.is_active = true
LEFT JOIN public.conversations c ON u.id = c.user_id
LEFT JOIN public.messages m ON c.id = m.conversation_id
GROUP BY u.id, u.email, u.name, u.tokens_used, u.tokens_limit, u.is_admin, u.created_at;

-- View for system analytics
CREATE VIEW public.system_analytics AS
SELECT
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT m.id) as total_messages,
    SUM(u.tokens_used) as total_tokens_used,
    AVG(u.tokens_used) as avg_tokens_per_user
FROM public.users u
LEFT JOIN public.agents a ON u.id = a.user_id
LEFT JOIN public.conversations c ON u.id = c.user_id
LEFT JOIN public.messages m ON c.id = m.conversation_id;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read access to anonymous users for public config
GRANT SELECT ON public.system_config TO anonymous;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'User profiles and authentication data';
COMMENT ON TABLE public.agents IS 'AI agents created by users';
COMMENT ON TABLE public.conversations IS 'Chat conversations between users and agents';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON TABLE public.agent_memory IS 'Memory storage for AI agents';
COMMENT ON TABLE public.request_logs IS 'API request logging for monitoring';
COMMENT ON TABLE public.system_config IS 'System-wide configuration settings';
COMMENT ON TABLE public.api_keys IS 'API keys for external integrations';
COMMENT ON TABLE public.usage_analytics IS 'User activity and usage analytics';

-- Schema version for migrations
INSERT INTO public.system_config (config_key, config_value, description, is_public) VALUES
('schema_version', '{"version": "1.0.0", "created_at": "2024-01-01", "description": "Initial complete schema"}', 'Database schema version', false);
