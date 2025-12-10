// server/controllers/walletWebService.js
import { generatePassBuffer } from './appleWallet.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co';

// Proxy URL para operaciones de base de datos
const PROXY_URL = process.env.WALLET_PROXY_URL || `${SUPABASE_URL}/functions/v1/wallet-db-proxy`;
const PROXY_SECRET = process.env.WALLET_PROXY_SECRET;

/**
 * Helper: Llamar al proxy de base de datos
 */
async function callProxy(action, data) {
  if (!PROXY_SECRET) {
    console.error('[Wallet WS] WALLET_PROXY_SECRET no configurado');
    throw new Error('WALLET_PROXY_SECRET no configurada');
  }

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
    console.error(`[Wallet WS] Proxy error (${action}):`, error);
    throw new Error(`Proxy error: ${error}`);
  }

  return await response.json();
}

/**
 * Extrae el token de autorización del header
 * Normaliza el token quitando el prefijo y espacios extra
 */
function extractAuthToken(authHeader) {
  if (!authHeader) return null;
  // Normalizar: quitar prefijo "ApplePass ", espacios extra y trim
  return authHeader
    .replace(/^ApplePass\s+/i, '') // Quitar prefijo con cualquier cantidad de espacios
    .replace(/\s+/g, '') // Quitar espacios intermedios
    .trim();
}

/**
 * Valida el token de autenticación usando el proxy
 */
async function validateAuthToken(serialNumber, token) {
  if (!token) return null;
  
  try {
    const result = await callProxy('verify-token', {
      serial_number: serialNumber,
      auth_token: token
    });

    if (result.valid) {
      return { user_id: result.user_id };
    }
    return null;
  } catch (error) {
    console.error('[Wallet WS] Error validando token:', error);
    return null;
  }
}

/**
 * POST /api/wallet/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
 */
export async function registerDevice(req, res) {
  const { deviceId, passTypeId, serialNumber } = req.params;
  const authToken = extractAuthToken(req.headers.authorization);
  const pushToken = req.body?.pushToken;
  
  console.log(`[Wallet WS] Registro: device=${deviceId}, serial=${serialNumber}`);
  
  if (!pushToken) {
    console.error('[Wallet WS] Falta pushToken en el body');
    return res.status(400).send();
  }
  
  const validToken = await validateAuthToken(serialNumber, authToken);
  if (!validToken) {
    console.error('[Wallet WS] Token inválido para', serialNumber);
    return res.status(401).send();
  }
  
  try {
    await callProxy('register-device', {
      device_library_identifier: deviceId,
      push_token: pushToken,
      pass_type_id: passTypeId,
      serial_number: serialNumber,
      auth_token: authToken,
      user_id: validToken.user_id
    });
    
    console.log(`[Wallet WS] Dispositivo registrado: ${deviceId}`);
    res.status(201).send();
  } catch (error) {
    console.error('[Wallet WS] Error registrando:', error);
    res.status(500).send();
  }
}

/**
 * GET /api/wallet/v1/devices/:deviceId/registrations/:passTypeId
 */
export async function listPasses(req, res) {
  const { deviceId, passTypeId } = req.params;
  const passesUpdatedSince = req.query.passesUpdatedSince;
  
  console.log(`[Wallet WS] Listando pases para device=${deviceId}`);
  
  try {
    const result = await callProxy('list-passes', {
      device_library_identifier: deviceId,
      pass_type_id: passTypeId,
      passes_updated_since: passesUpdatedSince
    });
    
    if (!result.serial_numbers || result.serial_numbers.length === 0) {
      return res.status(204).send();
    }
    
    res.json({
      serialNumbers: result.serial_numbers,
      lastUpdated: result.last_updated
    });
  } catch (error) {
    console.error('[Wallet WS] Error listando:', error);
    res.status(500).send();
  }
}

/**
 * GET /api/wallet/v1/passes/:passTypeId/:serialNumber
 */
export async function getUpdatedPass(req, res) {
  const { serialNumber } = req.params;
  const authHeader = req.headers.authorization;
  const authToken = extractAuthToken(authHeader);
  
  console.log(`[Wallet WS] Solicitando pase actualizado: ${serialNumber}`);
  console.log(`[Wallet WS] Auth header recibido: "${authHeader}"`);
  console.log(`[Wallet WS] Token extraído (primeros 20): "${authToken?.substring(0, 20)}..."`);
  console.log(`[Wallet WS] Token length: ${authToken?.length || 0}`);
  
  const validToken = await validateAuthToken(serialNumber, authToken);
  if (!validToken) {
    console.error(`[Wallet WS] Token inválido para serial: ${serialNumber}`);
    console.error(`[Wallet WS] Token enviado: "${authToken}"`);
    return res.status(401).send();
  }
  
  try {
    const userData = await callProxy('get-user-state', {
      user_id: validToken.user_id
    });
    
    if (userData.error) {
      console.error('[Wallet WS] Usuario no encontrado:', validToken.user_id);
      return res.status(404).send();
    }
    
    const passBuffer = await generatePassBuffer({
      id: validToken.user_id,
      stamps: userData.stamps,
      cashbackPoints: userData.cashback_points,
      levelPoints: userData.level_points,
      name: userData.name
    });
    
    console.log(`[Wallet WS] Pase generado: ${serialNumber}, ${userData.stamps} sellos`);
    
    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.set('Last-Modified', new Date().toUTCString());
    res.send(passBuffer);
  } catch (error) {
    console.error('[Wallet WS] Error generando pase:', error);
    res.status(500).send();
  }
}

/**
 * DELETE /api/wallet/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
 */
export async function unregisterDevice(req, res) {
  const { deviceId, serialNumber } = req.params;
  
  console.log(`[Wallet WS] Desregistrar: device=${deviceId}, serial=${serialNumber}`);
  
  try {
    await callProxy('unregister-device', {
      device_library_identifier: deviceId,
      serial_number: serialNumber
    });
    
    console.log(`[Wallet WS] Dispositivo desregistrado: ${deviceId}`);
    res.status(200).send();
  } catch (error) {
    console.error('[Wallet WS] Error desregistrando:', error);
    res.status(500).send();
  }
}

/**
 * POST /api/wallet/v1/log
 */
export function receiveLog(req, res) {
  console.log('[Wallet WS] Log del dispositivo:', JSON.stringify(req.body, null, 2));
  res.status(200).send();
}

/**
 * Notifica a todos los dispositivos de un usuario que actualicen el pase
 */
export async function notifyUserDevices(userId) {
  try {
    const result = await callProxy('notify-devices', { user_id: userId });
    
    if (result.error) {
      console.error('[Wallet WS] Error obteniendo dispositivos:', result.error);
      return { success: false, error: result.error };
    }
    
    if (result.devices === 0) {
      console.log(`[Wallet WS] Usuario ${userId} no tiene dispositivos registrados`);
    }
    
    return {
      success: true,
      devices: result.devices,
      tokens: result.tokens
    };
  } catch (error) {
    console.error('[Wallet WS] Error:', error);
    return { success: false, error };
  }
}
