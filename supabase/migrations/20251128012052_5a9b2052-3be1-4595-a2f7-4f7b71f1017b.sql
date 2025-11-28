-- Agregar columnas para sistema de niveles
ALTER TABLE public.customer_state
ADD COLUMN IF NOT EXISTS level_points integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_points_reset_at timestamp with time zone DEFAULT now();

-- Comentarios para documentación
COMMENT ON COLUMN public.customer_state.level_points IS 'Puntos acumulados para determinar nivel (Cliente Le Duo vs Leduo Leyend). Se reinician semestralmente.';
COMMENT ON COLUMN public.customer_state.level_points_reset_at IS 'Fecha del último reinicio de puntos de nivel';