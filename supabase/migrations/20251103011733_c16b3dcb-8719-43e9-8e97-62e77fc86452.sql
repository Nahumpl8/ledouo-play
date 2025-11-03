-- Arreglar search_path en funciones para seguridad

-- Actualizar función update_updated_at_column con search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Actualizar función handle_new_user con search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;