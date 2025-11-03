-- Agregar políticas RLS para que los usuarios puedan insertar sus propias recompensas
CREATE POLICY "Users can insert own rewards" 
ON public.rewards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Agregar políticas RLS para visitas (si se necesitan en el futuro)
CREATE POLICY "Users can insert own visits" 
ON public.visits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);