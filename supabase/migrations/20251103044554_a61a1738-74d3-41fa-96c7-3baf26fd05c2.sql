-- Crear enum para roles de usuario (si no existe)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función para verificar roles (SECURITY DEFINER para evitar recursión)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas para user_roles (con manejo de existentes)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas adicionales para customer_state
DROP POLICY IF EXISTS "Staff can view all states" ON public.customer_state;
CREATE POLICY "Staff can view all states"
ON public.customer_state FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Tabla de visitas/compras
CREATE TABLE IF NOT EXISTS public.visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount_spent numeric(10,2) NOT NULL CHECK (amount_spent > 0),
    cashback_earned integer DEFAULT 0,
    stamps_earned integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Políticas para visits
DROP POLICY IF EXISTS "Users can view own visits" ON public.visits;
CREATE POLICY "Users can view own visits"
ON public.visits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all visits" ON public.visits;
CREATE POLICY "Staff can view all visits"
ON public.visits FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Actualizar función handle_new_user para asignar rol de customer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Crear perfil
  INSERT INTO public.profiles (id, name, email, phone, sex, dob, registration_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.raw_user_meta_data->>'sex',
    (NEW.raw_user_meta_data->>'dob')::date,
    COALESCE(NEW.raw_user_meta_data->>'registration_code', 'DIRECT')
  );
  
  -- Crear estado inicial con 0 puntos y 0 sellos
  INSERT INTO public.customer_state (user_id, cashback_points, stamps)
  VALUES (NEW.id, 0, 0);
  
  -- Asignar rol de customer por defecto
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();