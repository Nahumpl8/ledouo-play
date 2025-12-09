// server/index.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { createApplePass } from './controllers/appleWallet.js';
import { 
  registerDevice, 
  listPasses, 
  getUpdatedPass, 
  unregisterDevice, 
  receiveLog,
  notifyUserDevices 
} from './controllers/walletWebService.js';
import { sendPassUpdateNotification } from './controllers/apnsPush.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Supabase client con service role para operaciones del servidor
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// En desarrollo permitimos el front local; en prod no hace falta (misma origin)
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  app.use(cors({
    origin: ['http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}

// URLs de Supabase Storage para imágenes de sellos
const STORAGE_BASE = 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images';
const STAMP_SPRITES = {
  0: `${STORAGE_BASE}/0-sellos.png`,
  1: `${STORAGE_BASE}/1-sellos.png`,
  2: `${STORAGE_BASE}/2-sellos.png`,
  3: `${STORAGE_BASE}/3-sellos.png`,
  4: `${STORAGE_BASE}/4-sellos.png`,
  5: `${STORAGE_BASE}/5-sellos.png`,
  6: `${STORAGE_BASE}/6-sellos.png`,
  7: `${STORAGE_BASE}/7-sellos.png`,
  8: `${STORAGE_BASE}/8-sellos.png`,
};

// === ENV ===
const SERVICE_ACCOUNT_EMAIL = process.env.WALLET_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = (process.env.WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID;

function ensureEnv(res) {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !ISSUER_ID || !CLASS_ID) {
    res.status(500).json({ error: 'Faltan variables de entorno de Google Wallet' });
    return false;
  }
  return true;
}

// ====================================
// GOOGLE WALLET API
// ====================================
app.post('/api/wallet/save', (req, res) => {
  try {
    if (!ensureEnv(res)) return;

    const { objectIdSuffix, customerData = {} } = req.body || {};
    if (!objectIdSuffix) {
      return res.status(400).json({
        error: 'Falta objectIdSuffix',
        received: req.body,
        hint: 'El cliente debe mandar { objectIdSuffix, customerData }'
      });
    }

    let rawId = customerData.id || objectIdSuffix || '';
    const cleanUserId = rawId
      .replace('leduo_customer_', '')
      .replace('LEDUO-', '')
      .replace('leduo-', '')
      .replace(':', '')
      .trim();

    if (!cleanUserId) {
      return res.status(400).json({ error: 'No se pudo obtener un ID válido para el pase.' });
    }

    const fullObjectId = `${ISSUER_ID}.LEDUO-${cleanUserId}`;
    const barcodeValue = `LEDUO-${cleanUserId}`;

    const stamps = customerData.stamps || 0;
    const points = customerData.cashbackPoints || 0;
    const levelPoints = customerData.levelPoints || 0;
    const customerName = customerData.name || 'Cliente LeDuo';
    const level = levelPoints > 150 ? 'Leduo Leyend' : 'Cliente Le Duo';
    const backgroundColor = levelPoints > 150 ? '#2C3E50' : '#D4C5B9';
    const now = Math.floor(Date.now() / 1000);

    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600,
      payload: {
        genericObjects: [{
          id: fullObjectId,
          classId: CLASS_ID,
          state: 'ACTIVE',
          hexBackgroundColor: backgroundColor,
          cardTitle: {
            defaultValue: { language: 'es', value: 'LeDuo - Tarjeta de Lealtad' }
          },
          subheader: {
            defaultValue: { language: 'es', value: `${customerName} • ${level}` }
          },
          header: {
            defaultValue: {
              language: 'es',
              value: stamps >= 8 ? '🎁 ¡Canjea tu bebida!' : `${stamps}/8 sellos`
            }
          },
          logo: {
            sourceUri: { uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png' },
            contentDescription: {
              defaultValue: { language: 'es', value: 'Logo LeDuo' }
            }
          },
          heroImage: {
            sourceUri: { uri: STAMP_SPRITES[Math.min(stamps, 8)] },
            contentDescription: {
              defaultValue: { language: 'es', value: 'Chef LeDuo' }
            }
          },
          barcode: {
            type: 'QR_CODE',
            value: barcodeValue,
            alternateText: `Cliente: ${cleanUserId.substring(0, 8)}`
          },
          textModulesData: [
            { header: 'Tu Nivel LeDuo', body: `${levelPoints} puntos • ${level}`, id: 'level' },
            {
              header: 'Progreso de Sellos',
              body: stamps >= 8 
                ? '¡Completaste 8 sellos! Muestra este pase para canjear tu bebida gratis.' 
                : `${stamps} de 8 sellos. ${Math.max(0, 8 - stamps)} para tu recompensa.`,
              id: 'stamps'
            },
            { header: '¿Cómo usar tu tarjeta?', body: 'Muestra tu código QR en caja para acumular puntos y sellos en cada compra.', id: 'instructions' },
            { header: 'Beneficios', body: 'Gana puntos por cada compra. Completa 8 sellos para bebida gratis. +150 puntos = Leduo Leyend.', id: 'benefits' }
          ],
          linksModuleData: {
            uris: [
              { uri: 'https://maps.app.goo.gl/j1VUSDoehyfLLZUUA', description: 'Cómo llegar a LeDuo', id: 'location' },
              { uri: 'tel:+7711295938', description: 'Llamar a LeDuo', id: 'phone' }
            ]
          }
        }]
      }
    };

    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    res.json({ saveUrl, objectId: fullObjectId });
  } catch (err) {
    console.error('Wallet save error:', err);
    res.status(500).json({ error: 'No se pudo generar el token de Wallet' });
  }
});

// ====================================
// APPLE WALLET - Crear pase
// ====================================
app.post('/api/wallet/apple', createApplePass);

// ====================================
// APPLE WALLET WEB SERVICE (Protocolo de actualizaciones)
// ====================================

// Registrar dispositivo cuando usuario añade pase
app.post('/api/wallet/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber', registerDevice);

// Listar pases de un dispositivo
app.get('/api/wallet/v1/devices/:deviceId/registrations/:passTypeId', listPasses);

// Obtener pase actualizado (CRÍTICO)
app.get('/api/wallet/v1/passes/:passTypeId/:serialNumber', getUpdatedPass);

// Desregistrar dispositivo
app.delete('/api/wallet/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber', unregisterDevice);

// Logs de errores del pase
app.post('/api/wallet/v1/log', receiveLog);

// ====================================
// ENDPOINT PARA NOTIFICAR ACTUALIZACIONES
// ====================================
app.post('/api/wallet/notify-update', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }
  
  console.log(`[Wallet Notify] Notificando actualización para usuario: ${userId}`);
  
  try {
    // Obtener dispositivos del usuario
    const result = await notifyUserDevices(userId);
    
    if (!result.success) {
      return res.status(500).json({ error: 'Error obteniendo dispositivos' });
    }
    
    if (result.devices === 0) {
      return res.json({ success: true, message: 'No hay dispositivos registrados', notified: 0 });
    }
    
    // Enviar notificación push a APNs
    const pushResult = await sendPassUpdateNotification(result.tokens);
    
    res.json({ 
      success: true, 
      notified: pushResult.sent,
      failed: pushResult.failed
    });
    
  } catch (error) {
    console.error('[Wallet Notify] Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ====================================
// HEALTHCHECK
// ====================================
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ====================================
// STATIC FILES
// ====================================
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
  if (isDev) console.log('Dev CORS enabled for http://localhost:8080');
});
