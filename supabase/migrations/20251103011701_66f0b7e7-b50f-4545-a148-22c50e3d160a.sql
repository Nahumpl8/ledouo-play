-- =====================================================
-- LEDUO LOYALTY SYSTEM - DATABASE SCHEMA
-- =====================================================

-- Tabla de perfiles de usuario (información adicional del cliente)
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  sex text,
  dob date,
  registration_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles (los usuarios solo ven su propio perfil)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tabla de estado del cliente (puntos, sellos, ruleta)
CREATE TABLE public.customer_state (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  cashback_points integer NOT NULL DEFAULT 0,
  stamps integer NOT NULL DEFAULT 0,
  last_visit timestamptz,
  roulette_mode text NOT NULL DEFAULT 'weekly' CHECK (roulette_mode IN ('weekly', 'visits')),
  roulette_cooldown_days integer NOT NULL DEFAULT 7,
  roulette_last_spin_at timestamptz,
  roulette_required_visits integer NOT NULL DEFAULT 5,
  roulette_visits_since_last_spin integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS en customer_state
ALTER TABLE public.customer_state ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customer_state
CREATE POLICY "Users can view own state"
  ON public.customer_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own state"
  ON public.customer_state FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabla de visitas (historial de cada visita a la cafetería)
CREATE TABLE public.visits (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visit_date timestamptz NOT NULL DEFAULT now(),
  amount_spent numeric(10, 2),
  stamps_earned integer NOT NULL DEFAULT 1,
  cashback_earned integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS en visits
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para visits
CREATE POLICY "Users can view own visits"
  ON public.visits FOR SELECT
  USING (auth.uid() = user_id);

-- Tabla de premios/recompensas ganados
CREATE TABLE public.rewards (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('points', 'stamp', 'coupon', 'free_item')),
  value text NOT NULL,
  description text NOT NULL,
  source text NOT NULL CHECK (source IN ('roulette', 'challenge', 'promotion')),
  redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  earned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Habilitar RLS en rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rewards
CREATE POLICY "Users can view own rewards"
  ON public.rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON public.rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS Y FUNCIONES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para customer_state
CREATE TRIGGER update_customer_state_updated_at
  BEFORE UPDATE ON public.customer_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, sex, registration_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'sex',
    COALESCE(NEW.raw_user_meta_data->>'registration_code', 'DIRECT')
  );
  
  -- Crear estado inicial del cliente
  INSERT INTO public.customer_state (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil cuando se crea usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Índices para mejorar rendimiento
CREATE INDEX idx_visits_user_id ON public.visits(user_id);
CREATE INDEX idx_visits_date ON public.visits(visit_date DESC);
CREATE INDEX idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX idx_rewards_redeemed ON public.rewards(redeemed, user_id);