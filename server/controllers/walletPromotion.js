// server/controllers/walletPromotion.js
import { notifyUserDevices } from './walletWebService.js';
import { sendPassUpdateNotification } from './apnsPush.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co';
const PROXY_URL = process.env.WALLET_PROXY_URL || `${SUPABASE_URL}/functions/v1/wallet-db-proxy`;
const PROXY_SECRET = process.env.WALLET_PROXY_SECRET;

// Helper: llamar al proxy
async function callProxy(action, data) {
  if (!PROXY_SECRET) {
    console.warn('[WalletPromo] WALLET_PROXY_SECRET no configurado');
    return null;
  }

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-secret': PROXY_SECRET
      },
      body: JSON.stringify({ action, ...data })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[WalletPromo] Proxy error (${action}):`, error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[WalletPromo] Proxy error (${action}):`, error.message);
    return null;
  }
}

/**
 * Enviar promoción a todos los dispositivos registrados
 */
export const sendPromotion = async (req, res) => {
  try {
    const { promotionId } = req.body;
    
    if (!promotionId) {
      return res.status(400).json({ error: 'Falta promotionId' });
    }
    
    console.log(`[WalletPromo] Enviando promoción: ${promotionId}`);
    
    // Obtener todos los dispositivos registrados
    const result = await callProxy('get-all-devices', {});
    
    if (!result?.devices || result.devices.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No hay dispositivos registrados', 
        notified: 0 
      });
    }
    
    // Extraer push tokens únicos
    const pushTokens = [...new Set(result.devices.map(d => d.push_token).filter(Boolean))];
    
    if (pushTokens.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No hay tokens de push válidos', 
        notified: 0 
      });
    }
    
    // Enviar push notifications
    const pushResult = await sendPassUpdateNotification(pushTokens);
    
    // Marcar promoción como enviada
    await callProxy('mark-promotion-sent', { promotion_id: promotionId });
    
    res.json({ 
      success: true, 
      notified: pushResult.sent,
      failed: pushResult.failed,
      totalDevices: result.devices.length
    });
    
  } catch (error) {
    console.error('[WalletPromo] Error:', error);
    res.status(500).json({ error: 'Error enviando promoción' });
  }
};

/**
 * Obtener configuración de cumpleaños
 */
export const getBirthdayConfig = async (req, res) => {
  try {
    const result = await callProxy('get-birthday-config', {});
    
    if (!result?.config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json(result.config);
  } catch (error) {
    console.error('[WalletPromo] Error obteniendo config:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

/**
 * Actualizar configuración de cumpleaños
 */
export const updateBirthdayConfig = async (req, res) => {
  try {
    const config = req.body;
    
    const result = await callProxy('update-birthday-config', { config });
    
    if (!result?.success) {
      return res.status(500).json({ error: 'Error actualizando configuración' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('[WalletPromo] Error actualizando config:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};
