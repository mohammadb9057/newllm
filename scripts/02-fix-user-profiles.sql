-- Create function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, tokens_used, tokens_limit, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    0,
    1000,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add api_token column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS api_token TEXT UNIQUE;

-- Generate API tokens for existing users who don't have one
UPDATE public.users 
SET api_token = 'llm_' || encode(gen_random_bytes(32), 'hex')
WHERE api_token IS NULL;

-- Create index on api_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_api_token ON public.users(api_token);

-- Insert profiles for existing auth users who don't have profiles
INSERT INTO public.users (id, email, name, tokens_used, tokens_limit, is_admin, api_token)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  0,
  1000,
  false,
  'llm_' || encode(gen_random_bytes(32), 'hex')
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
