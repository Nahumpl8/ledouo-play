-- Crear tabla de eventos
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  date date NOT NULL,
  time text NOT NULL,
  location text DEFAULT 'Centro',
  price numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 20,
  spots_available integer NOT NULL DEFAULT 20,
  image_gradient text DEFAULT 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de reservaciones
CREATE TABLE public.event_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  spots_reserved integer DEFAULT 1,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  total_amount numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos: lectura pública
CREATE POLICY "Anyone can view active events"
ON public.events FOR SELECT
USING (is_active = true);

-- Admins y admin_events pueden ver todos los eventos
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'admin_events'));

-- Admins y admin_events pueden crear eventos
CREATE POLICY "Admins can create events"
ON public.events FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'admin_events'));

-- Admins y admin_events pueden actualizar eventos
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'admin_events'));

-- Admins y admin_events pueden eliminar eventos
CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'admin_events'));

-- Políticas para reservaciones
-- Usuarios autenticados pueden ver sus propias reservaciones
CREATE POLICY "Users can view own reservations"
ON public.event_reservations FOR SELECT
USING (auth.uid() = user_id);

-- Admins pueden ver todas las reservaciones
CREATE POLICY "Admins can view all reservations"
ON public.event_reservations FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'admin_events'));

-- Cualquiera puede crear reservaciones (para invitados también)
CREATE POLICY "Anyone can create reservations"
ON public.event_reservations FOR INSERT
WITH CHECK (true);

-- Admins pueden actualizar reservaciones
CREATE POLICY "Admins can update reservations"
ON public.event_reservations FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'admin_events'));

-- Admins pueden eliminar reservaciones
CREATE POLICY "Admins can delete reservations"
ON public.event_reservations FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'admin_events'));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_reservations_updated_at
BEFORE UPDATE ON public.event_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();