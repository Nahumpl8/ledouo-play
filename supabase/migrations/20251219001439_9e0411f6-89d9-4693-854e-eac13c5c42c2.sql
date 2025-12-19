-- Agregar columna para texto de notificación de ubicación en Apple Wallet
ALTER TABLE birthday_config
ADD COLUMN wallet_location_text text DEFAULT '🍵 ¿Antojo de Matcha o Café? ¡Estás cerca de Le Duo! Ven y disfruta ✨';