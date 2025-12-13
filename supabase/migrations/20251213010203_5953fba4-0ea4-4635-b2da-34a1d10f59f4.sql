-- Allow admins to update any customer_state (for stamps and points)
CREATE POLICY "Admins can update any customer state"
ON public.customer_state
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));