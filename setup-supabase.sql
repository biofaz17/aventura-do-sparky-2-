
-- ==========================================================
-- SPARKYEDU DATABASE SETUP & SYNC SCRIPT
-- ==========================================================

-- 1. Tabela de Usuários (Credenciais e Perfil Administrativo)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  cpf TEXT,
  parent_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active BIGINT,
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- 2. Tabela de Perfis (Dados de Jogo e Progresso)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  password TEXT,
  parent_email TEXT,
  age INTEGER DEFAULT 8,
  subscription TEXT DEFAULT 'FREE',
  active_skin TEXT DEFAULT 'default',
  progress JSONB DEFAULT '{"stars": 0, "secretsFound": 0, "unlockedLevels": 1, "totalBlocksUsed": 0, "creativeProjects": 0}'::jsonb,
  settings JSONB DEFAULT '{"musicEnabled": true, "soundEnabled": true}'::jsonb,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS (Segurança de Linha)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso (TOTALMENTE Liberado para facilitar desenvolvimento)
-- Em produção real com AUTH do Supabase, estas seriam restritas ao auth.uid()
DROP POLICY IF EXISTS "Acesso Público Total Users" ON public.users;
CREATE POLICY "Acesso Público Total Users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Público Total Profiles" ON public.profiles;
CREATE POLICY "Acesso Público Total Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Trigger de Sincronização Automática (O SEGREDO DA ABSORÇÃO REAL)
-- Isso garante que ao criar um user na admin, o profile de jogo apareça instantaneamente
CREATE OR REPLACE FUNCTION public.sync_user_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, name, password, parent_email, age, subscription, progress, settings
  ) VALUES (
    NEW.id,
    COALESCE(NEW.profile_data->>'name', NEW.username),
    NEW.password,
    NEW.parent_email,
    COALESCE((NEW.profile_data->>'age')::integer, 8),
    COALESCE(NEW.profile_data->>'subscription', 'FREE'),
    COALESCE(NEW.profile_data->'progress', '{"stars": 0, "secretsFound": 0, "unlockedLevels": 1, "totalBlocksUsed": 0, "creativeProjects": 0}'::jsonb),
    COALESCE(NEW.profile_data->'settings', '{"musicEnabled": true, "soundEnabled": true}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.profile_data->>'name', EXCLUDED.name),
    password = NEW.password,
    parent_email = NEW.parent_email,
    age = COALESCE((NEW.profile_data->>'age')::integer, EXCLUDED.age),
    subscription = COALESCE(NEW.profile_data->>'subscription', EXCLUDED.subscription),
    progress = COALESCE(NEW.profile_data->'progress', public.profiles.progress),
    settings = COALESCE(NEW.profile_data->'settings', public.profiles.settings),
    last_active = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_user_to_profile ON public.users;
CREATE TRIGGER tr_sync_user_to_profile
AFTER INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_to_profile();

-- 6. Trigger de Deleção Cascade
CREATE OR REPLACE FUNCTION public.delete_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_delete_user_profile ON public.users;
CREATE TRIGGER tr_delete_user_profile
AFTER DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.delete_user_profile();
