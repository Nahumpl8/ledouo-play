// server/controllers/apnsPush.js
import apn from 'apn';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let apnProvider = null;

function getApnProvider() {
  if (!apnProvider) {
    try {
      apnProvider = new apn.Provider({
        cert: path.join(__dirname, '../certs/signerCert.pem'),
        key: path.join(__dirname, '../certs/signerKey.pem'),
        production: true // Apple Wallet usa producción siempre
      });
      console.log('[APNs] Provider inicializado correctamente');
    } catch (error) {
      console.error('[APNs] Error inicializando provider:', error);
      throw error;
    }
  }
  return apnProvider;
}

/**
 * Envía notificación push vacía a Apple para actualizar el pase
 * @param {string[]} pushTokens - Array de push tokens de dispositivos
 * @returns {Promise<{sent: number, failed: number}>}
 */
export async function sendPassUpdateNotification(pushTokens) {
  if (!pushTokens || pushTokens.length === 0) {
    console.log('[APNs] No hay tokens para notificar');
    return { sent: 0, failed: 0 };
  }

  const provider = getApnProvider();
  
  // Apple requiere una notificación vacía para actualizar pases
  const notification = new apn.Notification();
  notification.payload = {};
  notification.topic = 'pass.com.leduo.loyalty'; // passTypeIdentifier
  
  try {
    const result = await provider.send(notification, pushTokens);
    console.log(`[APNs] Enviadas: ${result.sent.length}, Fallidas: ${result.failed.length}`);
    
    if (result.failed.length > 0) {
      result.failed.forEach(failure => {
        console.error('[APNs] Fallo:', failure.device, failure.response?.reason || failure.error);
      });
    }
    
    return {
      sent: result.sent.length,
      failed: result.failed.length,
      failures: result.failed
    };
  } catch (error) {
    console.error('[APNs] Error enviando notificaciones:', error);
    throw error;
  }
}

// Cleanup al cerrar el servidor
export function closeApnProvider() {
  if (apnProvider) {
    apnProvider.shutdown();
    apnProvider = null;
    console.log('[APNs] Provider cerrado');
  }
}
