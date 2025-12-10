-- Agregar columnas a la tabla events para soportar experiencias con horarios abiertos
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'fixed';
ALTER TABLE events ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60;

-- Crear tabla experience_time_slots para gestionar horarios de experiencias
CREATE TABLE public.experience_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity integer NOT NULL DEFAULT 4,
  spots_available integer NOT NULL DEFAULT 4,
  is_blocked boolean DEFAULT false,
  blocked_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE experience_time_slots ENABLE ROW LEVEL SECURITY;

-- Policies para time_slots
CREATE POLICY "Anyone can view active slots" ON experience_time_slots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_active = true)
  );

CREATE POLICY "Admins can manage slots" ON experience_time_slots
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'admin_events'::app_role)
  );

-- Crear tabla experience_reservations para reservaciones de experiencias
CREATE TABLE public.experience_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id uuid REFERENCES experience_time_slots(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  spots_reserved integer DEFAULT 1,
  status text DEFAULT 'confirmed',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE experience_reservations ENABLE ROW LEVEL SECURITY;

-- Policies para experience_reservations
CREATE POLICY "Anyone can create experience reservations" ON experience_reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own experience reservations" ON experience_reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all experience reservations" ON experience_reservations
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'admin_events'::app_role)
  );

CREATE POLICY "Admins can update experience reservations" ON experience_reservations
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'admin_events'::app_role)
  );

CREATE POLICY "Admins can delete experience reservations" ON experience_reservations
  FOR DELETE USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'admin_events'::app_role)
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_experience_time_slots_updated_at
  BEFORE UPDATE ON experience_time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_reservations_updated_at
  BEFORE UPDATE ON experience_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();