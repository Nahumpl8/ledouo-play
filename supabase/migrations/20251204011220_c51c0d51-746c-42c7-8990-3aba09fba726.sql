-- Agregar nuevo rol admin_events al enum existente
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin_events';