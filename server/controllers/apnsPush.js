// server/controllers/apnsPush.js
import apn from 'apn';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let apnProvider = null;

// ============================================================
// Helper: Cargar certificado desde variable de entorno Base64 o archivo local
// ============================================================
function getCertFromEnvOrFile(envName, fileName) {
  const b64 = process.env[envName];
  if (b64) {
    console.log(`[APNs] Cargando ${envName} desde variable de entorno`);
    return Buffer.from(b64, 'base64');
  }
  // Fallback a archivo local (desarrollo)
  const filePath = path.join(__dirname, '../certs', fileName);
  console.log(`[APNs] Cargando ${fileName} desde archivo local`);
  return filePath;
}

function getApnProvider() {
  if (!apnProvider) {
    try {
      const certValue = getCertFromEnvOrFile('APPLE_SIGNER_CERT_B64', 'signerCert.pem');
      const keyValue = getCertFromEnvOrFile('APPLE_SIGNER_KEY_B64', 'signerKey.pem');
      
      // Si son Buffers (desde env), usar cert/key directamente
      // Si son strings (rutas de archivo), también funcionan
      const providerOptions = {
        cert: certValue,
        key: keyValue,
        production: true // Apple Wallet usa producción siempre
      };
      
      apnProvider = new apn.Provider(providerOptions);
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
