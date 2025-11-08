// server/index.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { punchRouter } from './punchImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// CORS solo en dev
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  app.use(
    cors({
      origin: ['http://localhost:8080'],
      methods: ['POST', 'GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }),
  );
}

// Router para imágenes dinámicas (lo dejamos por compatibilidad)
// Si nos pasas 0-sellos.png, podemos quitar este fallback.
app.use('/api/wallet', punchRouter);

// ===== ENV =====
const SERVICE_ACCOUNT_EMAIL = process.env.WALLET_SERVICE_ACCOUNT_EMAIL; // sa@project.iam.gserviceaccount.com
const PRIVATE_KEY = (process.env.WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n'); // manejar \n escapados
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID; // p.ej. 3388...
const CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID;   // p.ej. 3388....leduo_loyalty_class
const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ||
  (isDev ? 'http://localhost:3001' : 'https://www.leduo.mx');

function ensureEnv(res) {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !ISSUER_ID || !CLASS_ID) {
    res.status(500).json({ error: 'Faltan variables de entorno de Google Wallet' });
    return false;
  }
  return true;
}

/**
 * Mapa de sprites estáticos por número de sellos (1–8).
 * Para 0 sellos hacemos fallback a la imagen dinámica actual.
 * Si tienes un PNG de “0-sellos”, pégalo aquí y quitamos el fallback.
 */
const STAMP_SPRITES = {
  0: 'https://i.ibb.co/63CV4yN/0-sellos.png',
  1: 'https://i.ibb.co/Z6JMptkH/1-sello.png',
  2: 'https://i.ibb.co/VYD6Kpk0/2-sellos.png',
  3: 'https://i.ibb.co/BHbybkYM/3-sellos.png',
  4: 'https://i.ibb.co/39YtppFz/4-sellos.png',
  5: 'https://i.ibb.co/pBpkMX7L/5-sellos.png',
  6: 'https://i.ibb.co/KzcK4mXh/6-sellos.png',
  7: 'https://i.ibb.co/358Mc3Q4/7-sellos.png',
  8: 'https://i.ibb.co/ZzJSwPhT/8-sellos.png',
};

// Devuelve la URL final del sprite según sellos (0–8)
function getStampsSpriteUrl(stamps) {
  const n = Math.max(0, Math.min(8, parseInt(stamps, 10) || 0));
  const bust = `v=${n}-${Date.now()}`;           // cache-busting
  return `${STAMP_SPRITES[n]}?${bust}`;
}

// ===== API: generar Save URL =====
app.post('/api/wallet/save', (req, res) => {
  try {
    if (!ensureEnv(res)) return;

    const { objectIdSuffix, customerData = {} } = req.body || {};

    if (!objectIdSuffix || !customerData.id) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['objectIdSuffix', 'customerData.id'],
        received: { objectIdSuffix, customerId: customerData.id },
      });
    }

    const fullObjectId = `${ISSUER_ID}.${objectIdSuffix}`;
    const userId = String(customerData.id);
    const stamps = Math.max(0, parseInt(customerData.stamps) || 0);
    const points = Math.max(0, parseInt(customerData.cashbackPoints) || 0);
    const customerName = customerData.name || 'Cliente LeDuo';
    const now = Math.floor(Date.now() / 1000);

    const spriteUrl = getStampsSpriteUrl(stamps);

    // Payload JWT para Loyalty Objects
    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600,
      payload: {
        loyaltyObjects: [
          {
            id: fullObjectId,         // `${ISSUER_ID}.${objectIdSuffix}`
            classId: CLASS_ID,        // debe ser `${ISSUER_ID}.algo`
            state: 'ACTIVE',

            // Requeridos por Loyalty Object
            accountId: userId,
            accountName: customerName,

            loyaltyPoints: {
              label: 'Puntos',
              balance: { string: String(points) }
            },

            // Branding básico permitido en object
            hexBackgroundColor: '#D4C5B9',
            logo: { sourceUri: { uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png' } },

            // QR
            barcode: {
              type: 'QR_CODE',
              value: `leduo:${userId}`,
              alternateText: userId.slice(0, 8)
            },

            // Texto
            textModulesData: [
              { id: 'stamps_progress', header: 'Sellos', body: `${Math.min(stamps, 8)}/8` },
              { id: 'program_name', header: 'Programa', body: 'LeDuo Rewards' }
            ],

            // ← AQUI VA LA IMAGEN DE SELLOS (sprite por número)
            imageModulesData: [
              {
                id: 'stamps_grid_big',
                mainImage: {
                  sourceUri: { uri: spriteUrl },
                  contentDescription: {
                    defaultValue: { language: 'es', value: 'Progreso de sellos' }
                  }
                }
              }
            ],

            // Links opcionales (no deberían romper)
            linksModuleData: {
              uris: [
                { uri: 'https://maps.app.goo.gl/j1VUSDoehyfLLZUUA', description: 'Cómo llegar a LeDuo', id: 'location' },
                { uri: 'tel:+7711295938', description: 'Llamar a LeDuo', id: 'phone' },
                { uri: 'https://leduo.mx', description: 'Sitio web', id: 'website' }
              ]
            }
          }
        ]
      }
    };



    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    res.json({ saveUrl, objectId: fullObjectId });
  } catch (err) {
    console.error('Wallet save error:', err);
    const detail = err instanceof Error ? err.message : 'Error desconocido';
    res.status(502).json({
      error: 'No se pudo generar el token de Wallet',
      details: detail,
    });
  }
});

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ===== STATIC (prod): servir build del front =====
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback SPA (no /api/*)
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
