
-- Tabla para configuración de cumpleaños (editable por admin)
CREATE TABLE public.birthday_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT true,
  days_before_notification integer NOT NULL DEFAULT 7,
  pre_birthday_message text NOT NULL DEFAULT '🎂 ¡Tu semana especial se acerca! Ven en la semana de tu cumpleaños y te regalamos 1 Galleta y además 15% OFF',
  pre_birthday_discount integer NOT NULL DEFAULT 15,
  birthday_message text NOT NULL DEFAULT '🎂 ¡Feliz Cumpleaños! Hoy es tu día especial, te regalamos 1 Galleta y además 15% OFF en tu compra',
  birthday_gift text NOT NULL DEFAULT '1 Galleta gratis',
  birthday_discount integer NOT NULL DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insertar configuración por defecto
INSERT INTO public.birthday_config (id) VALUES (gen_random_uuid());

-- Tabla para log de notificaciones enviadas (evitar duplicados)
CREATE TABLE public.birthday_notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- 'pre_birthday' o 'birthday'
  year integer NOT NULL,
  sent_at timestamptz DEFAULT now(),
  UNIQUE(user_id, notification_type, year)
);

-- Tabla para promociones manuales
CREATE TABLE public.wallet_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_type text NOT NULL DEFAULT 'all', -- 'all', 'specific_users'
  target_users uuid[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  sent_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.birthday_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_promotions ENABLE ROW LEVEL SECURITY;

-- Policies para birthday_config (solo admin puede ver/editar)
CREATE POLICY "Admins can view birthday config"
  ON public.birthday_config FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update birthday config"
  ON public.birthday_config FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies para birthday_notifications_log
CREATE POLICY "Service role can insert notifications log"
  ON public.birthday_notifications_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view notifications log"
  ON public.birthday_notifications_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies para wallet_promotions (admin gestiona)
CREATE POLICY "Admins can manage promotions"
  ON public.wallet_promotions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active promotions"
  ON public.wallet_promotions FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Triggers para updated_at
CREATE TRIGGER update_birthday_config_updated_at
  BEFORE UPDATE ON public.birthday_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_promotions_updated_at
  BEFORE UPDATE ON public.wallet_promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
