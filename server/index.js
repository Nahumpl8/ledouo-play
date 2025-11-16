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

// === CORS (solo dev) ===
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  app.use(cors({
    origin: ['http://localhost:8080'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }));
}

// === Rutas auxiliares (imágenes dinámicas) ===
app.use('/api/wallet', punchRouter);

// === ENV ===
const SERVICE_ACCOUNT_EMAIL = (process.env.WALLET_SERVICE_ACCOUNT_EMAIL || '').trim();
let PRIVATE_KEY = (process.env.WALLET_PRIVATE_KEY || '').trim();
const ISSUER_ID = (process.env.GOOGLE_WALLET_ISSUER_ID || '').trim();
const CLASS_ID = (process.env.GOOGLE_WALLET_CLASS_ID || '').trim();

// Normaliza saltos de línea en la private key
if (PRIVATE_KEY.includes('\\n')) PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
if (PRIVATE_KEY.includes('\r\n')) PRIVATE_KEY = PRIVATE_KEY.replace(/\r\n/g, '\n');
PRIVATE_KEY = PRIVATE_KEY.trim();

/** Revisa variables de entorno requeridas */
function ensureEnv(res) {
  const errors = [];
  if (!SERVICE_ACCOUNT_EMAIL) errors.push('WALLET_SERVICE_ACCOUNT_EMAIL');
  if (!PRIVATE_KEY || !PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) errors.push('WALLET_PRIVATE_KEY (formato inválido)');
  if (!ISSUER_ID) errors.push('GOOGLE_WALLET_ISSUER_ID');
  if (!CLASS_ID) errors.push('GOOGLE_WALLET_CLASS_ID');
  if (ISSUER_ID && CLASS_ID && !CLASS_ID.startsWith(`${ISSUER_ID}.`)) {
    errors.push(`GOOGLE_WALLET_CLASS_ID debe iniciar con "${ISSUER_ID}."`);
  }
  if (errors.length) {
    res.status(500).json({ error: 'ENV incompleto/incorrecto', details: errors });
    return false;
  }
  return true;
}



// === Sprites estáticos 0–8 (cuadrícula de sellos) ===
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
function getStampsSpriteUrl(stamps) {
  const n = Math.max(0, Math.min(8, parseInt(stamps, 10) || 0));
  const bust = `v=${n}-${Date.now()}`; // cache-busting
  return `${STAMP_SPRITES[n]}?${bust}`;
}

// === API: generar Save URL (Loyalty) ===
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

    // LoyaltyObject completo
    const loyaltyObject = {
      id: fullObjectId,
      classId: CLASS_ID,                 // debe iniciar con `${ISSUER_ID}.`
      state: 'ACTIVE',
      accountId: userId,
      accountName: customerName,

      // Visuales básicos
      hexBackgroundColor: '#D4C5B9',
      logo: { sourceUri: { uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png' } },

      // Puntos
      loyaltyPoints: { label: 'Puntos', balance: { string: String(points) } },

      // Código
      barcode: { type: 'QR_CODE', value: `leduo:${userId}`, alternateText: userId.slice(0, 8) },

      // Textos
      textModulesData: [
        { id: 'stamps_progress', header: 'Sellos', body: `${Math.min(stamps, 8)}/8` },
        { id: 'program_name', header: 'Programa', body: 'LeDuo Rewards' },
      ],

      // Imagen de sellos (sprite según progreso)
      imageModulesData: [
        {
          id: 'stamps_grid_big',
          mainImage: {
            sourceUri: { uri: getStampsSpriteUrl(stamps) },
            contentDescription: {
              defaultValue: { language: 'es', value: 'Progreso de sellos' },
            },
          },
        },
      ],

      // Enlaces
      linksModuleData: {
        uris: [
          { uri: 'https://maps.app.goo.gl/j1VUSDoehyfLLZUUA', description: 'Cómo llegar a LeDuo', id: 'location' },
          { uri: 'tel:+7711295938', description: 'Llamar a LeDuo', id: 'phone' },
          { uri: 'https://leduo.mx', description: 'Sitio web', id: 'website' },
        ],
      },
    };

    // Reclamaciones del JWT
    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600,
      // 👇 añade tus orígenes
      origins: ['https://www.leduo.mx', 'http://localhost:8080'],
      payload: {
        loyaltyObjects: [loyaltyObject],
      },
    };

    // Firma SIN `kid` (evita conflictos si el private_key_id no coincide)
    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    if (isDev) {
      console.log('---- GOOGLE WALLET DEBUG ----');
      console.log('ISSUER_ID:', ISSUER_ID);
      console.log('CLASS_ID:', CLASS_ID);
      console.log('SERVICE_ACCOUNT_EMAIL:', SERVICE_ACCOUNT_EMAIL);
      console.log('PRIVATE_KEY starts with BEGIN?', PRIVATE_KEY.startsWith('-----BEGIN PRIVATE KEY-----'));
      console.log('ObjectId:', fullObjectId);
      console.dir(loyaltyObject, { depth: null });
      console.log('-----------------------------');
    }

    res.json({ ok: true, saveUrl, objectId: fullObjectId });
  } catch (err) {
    console.error('Wallet save error:', err);
    res.status(502).json({
      error: 'No se pudo generar el token de Wallet',
      details: err?.message || 'Error desconocido',
    });
  }
});

// === Ruta de diagnóstico mínima (objeto básico) ===
// Úsala para aislar si el problema es firma/ENV o la estructura visual.
app.post('/api/wallet/sample', (req, res) => {
  try {
    if (!ensureEnv(res)) return;
    const now = Math.floor(Date.now() / 1000);
    const fullObjectId = `${ISSUER_ID}.sample_${Date.now()}`;

    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600,
      payload: {
        loyaltyObjects: [
          {
            id: fullObjectId,
            classId: CLASS_ID,
            state: 'ACTIVE',
            accountId: 'sample',
            accountName: 'Sample User',
            barcode: { type: 'QR_CODE', value: 'leduo:sample' },
          },
        ],
      },
    };

    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    res.json({ ok: true, saveUrl, objectId: fullObjectId });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Error sample' });
  }
});

// === Healthcheck ===
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// === Static (prod) y SPA fallback ===
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// === Arranque ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
  if (isDev) console.log('Dev CORS enabled for http://localhost:8080');
});
