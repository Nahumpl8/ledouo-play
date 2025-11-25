-- Permitir que staff vea todos los perfiles
CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'staff'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Permitir que staff vea todos los estados de clientes
CREATE POLICY "Staff can view all customer states"
ON public.customer_state
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'staff'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);