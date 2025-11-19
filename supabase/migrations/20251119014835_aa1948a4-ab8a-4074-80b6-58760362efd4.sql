-- Agregar columna para PIN hasheado del staff
ALTER TABLE public.profiles 
ADD COLUMN staff_pin TEXT;

-- Agregar columna para auditoría de quién procesó la venta
ALTER TABLE public.visits 
ADD COLUMN processed_by_staff_id UUID REFERENCES auth.users(id);

-- Índice para búsquedas rápidas
CREATE INDEX idx_visits_processed_by_staff ON public.visits(processed_by_staff_id);

COMMENT ON COLUMN public.profiles.staff_pin IS 'PIN hasheado (SHA-256) para autorizar ventas. Solo para usuarios staff/admin';
COMMENT ON COLUMN public.visits.processed_by_staff_id IS 'ID del staff que procesó esta venta para auditoría';