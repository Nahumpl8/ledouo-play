// server/controllers/walletWebService.js
import { createClient } from '@supabase/supabase-js';
import { generatePassBuffer } from './appleWallet.js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Extrae el token de autorización del header
 */
function extractAuthToken(authHeader) {
  if (!authHeader) return null;
  // Apple envía: "ApplePass {token}"
  return authHeader.replace('ApplePass ', '').trim();
}

/**
 * Valida el token de autenticación contra la base de datos
 */
async function validateAuthToken(serialNumber, token) {
  if (!token) return null;
  
  // Primero buscar en wallet_devices (dispositivos ya registrados)
  const { data: device } = await supabase
    .from('wallet_devices')
    .select('user_id')
    .eq('serial_number', serialNumber)
    .eq('auth_token', token)
    .single();
  
  if (device) return device;
  
  // Si no está en devices, buscar en auth_tokens (pase recién generado)
  const { data: authToken } = await supabase
    .from('wallet_auth_tokens')
    .select('user_id')
    .eq('serial_number', serialNumber)
    .eq('auth_token', token)
    .single();
  
  return authToken;
}

/**
 * POST /api/wallet/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
 * Registra un dispositivo cuando el usuario añade el pase a Wallet
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
  
  // Validar authenticationToken
  const validToken = await validateAuthToken(serialNumber, authToken);
  if (!validToken) {
    console.error('[Wallet WS] Token inválido para', serialNumber);
    return res.status(401).send();
  }
  
  try {
    // Registrar dispositivo (upsert por si ya existe)
    const { error } = await supabase
      .from('wallet_devices')
      .upsert({
        device_library_identifier: deviceId,
        push_token: pushToken,
        pass_type_id: passTypeId,
        serial_number: serialNumber,
        auth_token: authToken,
        user_id: validToken.user_id,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'device_library_identifier,serial_number' 
      });
    
    if (error) {
      console.error('[Wallet WS] Error registrando:', error);
      return res.status(500).send();
    }
    
    console.log(`[Wallet WS] Dispositivo registrado: ${deviceId}`);
    res.status(201).send();
    
  } catch (error) {
    console.error('[Wallet WS] Error:', error);
    res.status(500).send();
  }
}

/**
 * GET /api/wallet/v1/devices/:deviceId/registrations/:passTypeId
 * Lista los pases registrados en un dispositivo
 */
export async function listPasses(req, res) {
  const { deviceId, passTypeId } = req.params;
  const passesUpdatedSince = req.query.passesUpdatedSince;
  
  console.log(`[Wallet WS] Listando pases para device=${deviceId}`);
  
  try {
    let query = supabase
      .from('wallet_devices')
      .select('serial_number, updated_at')
      .eq('device_library_identifier', deviceId)
      .eq('pass_type_id', passTypeId);
    
    // Filtrar por fecha si se proporciona
    if (passesUpdatedSince) {
      const sinceDate = new Date(parseInt(passesUpdatedSince) * 1000).toISOString();
      query = query.gt('updated_at', sinceDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[Wallet WS] Error listando:', error);
      return res.status(500).send();
    }
    
    if (!data || data.length === 0) {
      return res.status(204).send();
    }
    
    // Encontrar la fecha más reciente
    const maxUpdated = data.reduce((max, d) => {
      const date = new Date(d.updated_at);
      return date > max ? date : max;
    }, new Date(0));
    
    res.json({
      serialNumbers: data.map(d => d.serial_number),
      lastUpdated: Math.floor(maxUpdated.getTime() / 1000).toString()
    });
    
  } catch (error) {
    console.error('[Wallet WS] Error:', error);
    res.status(500).send();
  }
}

/**
 * GET /api/wallet/v1/passes/:passTypeId/:serialNumber
 * Devuelve el pase actualizado (CRÍTICO para actualización)
 */
export async function getUpdatedPass(req, res) {
  const { serialNumber } = req.params;
  const authToken = extractAuthToken(req.headers.authorization);
  
  console.log(`[Wallet WS] Solicitando pase actualizado: ${serialNumber}`);
  
  // Validar token
  const validToken = await validateAuthToken(serialNumber, authToken);
  if (!validToken) {
    console.error('[Wallet WS] Token inválido');
    return res.status(401).send();
  }
  
  try {
    // Obtener datos actualizados del usuario
    const { data: state } = await supabase
      .from('customer_state')
      .select('stamps, cashback_points, level_points')
      .eq('user_id', validToken.user_id)
      .single();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', validToken.user_id)
      .single();
    
    if (!state || !profile) {
      console.error('[Wallet WS] Usuario no encontrado:', validToken.user_id);
      return res.status(404).send();
    }
    
    // Generar pase actualizado
    const passBuffer = await generatePassBuffer({
      id: validToken.user_id,
      stamps: state.stamps,
      cashbackPoints: state.cashback_points,
      levelPoints: state.level_points,
      name: profile.name
    });
    
    console.log(`[Wallet WS] Pase generado: ${serialNumber}, ${state.stamps} sellos`);
    
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
 * Desregistra un dispositivo cuando el usuario elimina el pase
 */
export async function unregisterDevice(req, res) {
  const { deviceId, serialNumber } = req.params;
  const authToken = extractAuthToken(req.headers.authorization);
  
  console.log(`[Wallet WS] Desregistrar: device=${deviceId}, serial=${serialNumber}`);
  
  try {
    const { error } = await supabase
      .from('wallet_devices')
      .delete()
      .eq('device_library_identifier', deviceId)
      .eq('serial_number', serialNumber);
    
    if (error) {
      console.error('[Wallet WS] Error desregistrando:', error);
      return res.status(500).send();
    }
    
    console.log(`[Wallet WS] Dispositivo desregistrado: ${deviceId}`);
    res.status(200).send();
    
  } catch (error) {
    console.error('[Wallet WS] Error:', error);
    res.status(500).send();
  }
}

/**
 * POST /api/wallet/v1/log
 * Recibe logs de error del dispositivo
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
    const { data: devices, error } = await supabase
      .from('wallet_devices')
      .select('push_token')
      .eq('user_id', userId);
    
    if (error) {
      console.error('[Wallet WS] Error obteniendo dispositivos:', error);
      return { success: false, error };
    }
    
    if (!devices || devices.length === 0) {
      console.log(`[Wallet WS] Usuario ${userId} no tiene dispositivos registrados`);
      return { success: true, devices: 0 };
    }
    
    // Actualizar updated_at para que Apple sepa que hay cambios
    await supabase
      .from('wallet_devices')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    
    return {
      success: true,
      devices: devices.length,
      tokens: devices.map(d => d.push_token)
    };
    
  } catch (error) {
    console.error('[Wallet WS] Error:', error);
    return { success: false, error };
  }
}
