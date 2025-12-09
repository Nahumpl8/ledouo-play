-- Tabla para guardar tokens de autenticación de pases
CREATE TABLE public.wallet_auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  auth_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para registrar dispositivos Apple Wallet
CREATE TABLE public.wallet_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_library_identifier TEXT NOT NULL,
  push_token TEXT NOT NULL,
  pass_type_id TEXT NOT NULL DEFAULT 'pass.com.leduo.loyalty',
  serial_number TEXT NOT NULL,
  auth_token TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(device_library_identifier, serial_number)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_wallet_devices_serial ON public.wallet_devices(serial_number);
CREATE INDEX idx_wallet_devices_user ON public.wallet_devices(user_id);
CREATE INDEX idx_wallet_auth_tokens_serial ON public.wallet_auth_tokens(serial_number);

-- Habilitar RLS
ALTER TABLE public.wallet_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo acceso con service role (desde el servidor)
CREATE POLICY "Service role full access devices" ON public.wallet_devices FOR ALL USING (true);
CREATE POLICY "Service role full access tokens" ON public.wallet_auth_tokens FOR ALL USING (true);