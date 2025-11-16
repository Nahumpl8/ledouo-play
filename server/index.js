// server/index.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { punchRouter } from './punchImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json());

const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  app.use(cors({
    origin: ['http://localhost:8080'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }));
}

// Imágenes dinámicas de sellos (compatibilidad)
app.use('/api/wallet', punchRouter);

// ===== ENV =====
const SERVICE_ACCOUNT_EMAIL = process.env.WALLET_SERVICE_ACCOUNT_EMAIL || '';
let   PRIVATE_KEY           = process.env.WALLET_PRIVATE_KEY || '';
const PRIVATE_KEY_ID        = process.env.WALLET_PRIVATE_KEY_ID || ''; // <-- NUEVO (private_key_id)
const ISSUER_ID             = process.env.GOOGLE_WALLET_ISSUER_ID || '';
const CLASS_ID              = process.env.GOOGLE_WALLET_CLASS_ID || '';
const PUBLIC_BASE_URL       =
  process.env.PUBLIC_BASE_URL ||
  (isDev ? 'http://localhost:3001' : 'https://www.leduo.mx');

// normaliza saltos de línea y trims
if (PRIVATE_KEY.includes('\\n')) PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
PRIVATE_KEY = PRIVATE_KEY.trim();

function ensureEnv(res) {
  const errors = [];
  if (!SERVICE_ACCOUNT_EMAIL) errors.push('WALLET_SERVICE_ACCOUNT_EMAIL');
  if (!PRIVATE_KEY)           errors.push('WALLET_PRIVATE_KEY');
  if (!PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) errors.push('WALLET_PRIVATE_KEY (formato)');
  if (!PRIVATE_KEY_ID)        errors.push('WALLET_PRIVATE_KEY_ID (private_key_id del JSON de la key)');
  if (!ISSUER_ID)             errors.push('GOOGLE_WALLET_ISSUER_ID');
  if (!CLASS_ID)              errors.push('GOOGLE_WALLET_CLASS_ID');
  if (!CLASS_ID.startsWith(`${ISSUER_ID}.`)) errors.push('CLASS_ID debe iniciar con "<ISSUER_ID>."');

  if (errors.length) {
    res.status(500).json({ error: 'ENV incompleto/incorrecto', details: errors });
    return false;
  }
  return true;
}

// Sprites estáticos 0–8
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
  const bust = `v=${n}-${Date.now()}`;
  return `${STAMP_SPRITES[n]}?${bust}`;
}

// ===== API: generar Save URL =====
app.post('/api/wallet/save', (req, res) => {
  try {
    if (!ensureEnv(res)) return;

    // Puedes pasar ?stage=1..5 para ir agregando campos de a poco
    const stage = Math.max(1, Math.min(5, parseInt(req.query.stage, 10) || 5));

    const { objectIdSuffix, customerData = {} } = req.body || {};
    if (!objectIdSuffix || !customerData.id) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['objectIdSuffix', 'customerData.id'],
        received: { objectIdSuffix, customerId: customerData.id },
      });
    }

    const fullObjectId = `${ISSUER_ID}.${objectIdSuffix}`;
    const userId       = String(customerData.id);
    const stamps       = Math.max(0, parseInt(customerData.stamps) || 0);
    const points       = Math.max(0, parseInt(customerData.cashbackPoints) || 0);
    const customerName = customerData.name || 'Cliente LeDuo';
    const now          = Math.floor(Date.now() / 1000);

    // Construimos el objeto por etapas
    const obj = {
      id: fullObjectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      accountId: userId,
      accountName: customerName,
    };

    if (stage >= 2) {
      obj.barcode = {
        type: 'QR_CODE',
        value: `leduo:${userId}`,
        alternateText: String(userId).slice(0, 8),
      };
    }
    if (stage >= 3) {
      obj.loyaltyPoints = {
        label: 'Puntos',
        balance: { string: String(points) },
      };
    }
    if (stage >= 4) {
      obj.textModulesData = [
        { id: 'stamps_progress', header: 'Sellos', body: `${Math.min(stamps, 8)}/8` },
        { id: 'program_name',    header: 'Programa', body: 'LeDuo Rewards' },
      ];
    }
    if (stage >= 5) {
      obj.hexBackgroundColor = '#D4C5B9';
      obj.logo = { sourceUri: { uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png' } };
      obj.imageModulesData = [
        {
          id: 'stamps_grid_big',
          mainImage: {
            sourceUri: { uri: getStampsSpriteUrl(stamps) },
            contentDescription: {
              defaultValue: { language: 'es', value: 'Progreso de sellos' },
            },
          },
        },
      ];
      obj.linksModuleData = {
        uris: [
          { uri: 'https://maps.app.goo.gl/j1VUSDoehyfLLZUUA', description: 'Cómo llegar a LeDuo', id: 'location' },
          { uri: 'tel:+7711295938',                            description: 'Llamar a LeDuo',    id: 'phone'    },
          { uri: 'https://leduo.mx',                           description: 'Sitio web',          id: 'website'  },
        ],
      };
    }

    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600, // 1 hora
      payload: { loyaltyObjects: [obj] },
    };

    // Debug útil en dev
    if (isDev) {
      console.log('---- GOOGLE WALLET DEBUG ----');
      console.log('Stage:', stage);
      console.log('ISSUER_ID:', ISSUER_ID);
      console.log('CLASS_ID:', CLASS_ID);
      console.log('SERVICE_ACCOUNT_EMAIL:', SERVICE_ACCOUNT_EMAIL);
      console.log('PRIVATE_KEY starts with BEGIN?', PRIVATE_KEY.startsWith('-----BEGIN PRIVATE KEY-----'));
      console.log('PRIVATE_KEY_ID (kid):', PRIVATE_KEY_ID);
      console.log('ObjectId:', fullObjectId);
      console.dir(obj, { depth: null });
      console.log('-----------------------------');
    }

    // ⬇️ Firmar con header.keyid (kid)
    const token = jwt.sign(claims, PRIVATE_KEY, {
      algorithm: 'RS256',
      keyid: PRIVATE_KEY_ID,
    });

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    res.json({ ok: true, saveUrl, objectId: fullObjectId });
  } catch (err) {
    console.error('Wallet save error:', err);
    const detail = err?.message || 'Error desconocido';
    res.status(502).json({ error: 'No se pudo generar el token de Wallet', details: detail });
  }
});

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Static (prod)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback
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
