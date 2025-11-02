// server/index.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// En desarrollo permitimos el front local; en prod no hace falta (misma origin)
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  app.use(cors({
    origin: ['http://localhost:8080'],
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }));
}

// === ENV ===
const SERVICE_ACCOUNT_EMAIL = process.env.WALLET_SERVICE_ACCOUNT_EMAIL; // sa@project.iam.gserviceaccount.com
const PRIVATE_KEY = (process.env.WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n'); // manejar \n escapados
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;  // p.ej. 3388...
const CLASS_ID  = process.env.GOOGLE_WALLET_CLASS_ID;   // p.ej. 3388....leduo_loyalty_class

function ensureEnv(res) {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !ISSUER_ID || !CLASS_ID) {
    res.status(500).json({ error: 'Faltan variables de entorno de Google Wallet' });
    return false;
  }
  return true;
}

// === API ===
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

    const fullObjectId = `${ISSUER_ID}.${objectIdSuffix}`;
    const now = Math.floor(Date.now() / 1000);

    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600, // 1h
      payload: {
        genericObjects: [{
          id: fullObjectId,
          classId: CLASS_ID,
          state: 'ACTIVE',

          // Básicos de la tarjeta
          cardTitle: { defaultValue: { language: 'es', value: 'LeDuo Loyalty Card' } },
          subheader: { defaultValue: { language: 'es', value: customerData.name || 'Cliente LeDuo' } },
          header: { defaultValue: { language: 'es', value: `${customerData.cashbackPoints || 0} puntos` } },

          // Logo (usa URL directa de imagen: png/jpg/webp)
          logo: {
            sourceUri: { uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png' },
            contentDescription: { defaultValue: { language: 'es', value: 'Logo LeDuo' } }
          },

          // Aquí puedes agregar textModulesData, linksModuleData, barcode, colores, etc.
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

// Healthcheck simple
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// === STATIC (producción): servir el build del FRONT ===
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback de SPA compatible con Express 5 (sin usar '*')
// Entrega index.html para GET que no sean /api/*
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
