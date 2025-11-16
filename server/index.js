// server/index.js

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; // Asegúrate de que este archivo exista si no usas los .env aquí
import path from 'path';
import { fileURLToPath } from 'url';
// import { punchRouter } from './punchImage.js'; // Descomenta si usas punchImage.js

// === Configuración de Rutas de Archivos ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// === Configuración de Variables de Entorno ===
// Usando directamente los valores proporcionados para ser más explícito
const SERVICE_ACCOUNT_EMAIL = "le-duo-wallet@leduo-471923.iam.gserviceaccount.com";
let PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCsevS8y+sXp9Xh\nmELjqGbJZ+vs3uktZuQKgYK2a43hj9cSzmXQs6N/56ia21FcpVUTlRP4YCI4PHye\nfWvyQhdNzygtAkVOw44dN0pAAw+8zHE2/dBgX8O1MzpjmDZDqC+U4OA1ZETBTyj7\n1WvO1oM0e807r6eNl+soGoPrZt+/+sItrvDzt6KZZcsahTBCKiYtx1HbjqYiqYHF\nTdWIMzgpKkzJkBEpv7/5vZM8OoKCqlKC8J5fAtusrx5tcJQgu4GoCtKgUqqq6Qp2\nSZcSl0h8kCzhgNtzJB4d2CmjrcrhQHt31yTP/KcgJP1ZBer45fnX0jRFX/g6OdfH\nqoOGddP9AgMBAAECggIAJy0jZzmjG6On0T6yHL8cn60e2ZXVHVakP92kWLZrytrO\n1Wrzldijr7Lo6Umc/J/iB9lh6JW/WAonHSGsUeGgpPADdluwbeA9qJWtJAZ9/dpq\n8bxrZuSBkagB4GrLkokCS7zbOE1ez5ChJLhYbSnssdBX8LFoa6EgzOJe6epbMqHM\n3uZRQru4BqJk9trEyZMTR/2PUzbcPCc+q+zY9CCyvHPcaaA4pcHLUg8SvTNA3J2b\np1ksyAf8tHjocrsTh04rBGb7SUIRkvctvzCYyKjB7NcZe5BS6zhuZztuSYa6bToi\ncTI32NAEF0GnN8qVSHe/nCp7IfEtfo0t+BGtfcLDQQKBgQDiO4pAIQknJWne2jQq\nlKyfg1JOOAbg3f56MpES+Ow98V7efP94/vfV2Axx7xry7TtYbOlzGgaJBYYGdTvg\nMN4u1ijQYfw2GXse/+FQGrechAp55hT0vds6tp/3vhatLUTkwj7bH4+6XenN7oDt\nWECE7lU+qoRhmGXsajqNVI5rvQKBgQDDLNBurg88cGduq2/KZ4UNcD3QGwie3rQa\nty7ivtoZ9Tq9noN+ZkdcW05Opq0IMosPcj/Dp4PWGYKVP28QHlIU2efTsaVs8dOU\nfwn4U9vlOoxFjg+FHol1hTB0pETfk8mnBAE8XWBF+J5u7qpXvyVUGbRZEIgcsUkX\nSa7uDHFtQQKBgQCchC7Q0UpA0AygBnzC3NtPjL3s07c7qklilyY88lx8En0nj5\nHUCrrO5nQNJ3MRO2yJr2bBILaEviWedT4ttEshvIl5HjZ9ubhdI/FkzjtyJ8VWc4\nL8XlqAWiY9vSchhQ3+aWuQ46FNE2DQUbr8vra+yED3rI/qO9XX0m3FIwTQKBgQC3\nkECAuEgwKe+90JOVpAMpfnVEcwiKkx6FOeBo9eMfItuaV6mIih13qZBevLhky1Sq\ntGNwWu7NwLRmNoD4gevlHITDP4M8kbzTHyB7ZDOexpADIvdJ1kymMRw/t/fm55Jy\n+HtJEPFpHcm0v9eKK4aqMHrEgZ3ijoMV2gEidqV/gQKBgQCHCqWBxtwYIe8N4WiR\nIqbFiSeE2yxjlis47ol6VEGGurJkF69YfytGKzZ2FnVf+H+P7Vi1I5FjQcrqxICk\n55wzLedPjW4JFm3jSAqWdFuOw9OncUSNOf2ogMS850TQNNEUsChntFlShv39+lQ3\nzM8Md8UjuQHGTAd4T50LWABlDQ==\n-----END PRIVATE KEY-----\n";
const ISSUER_ID = "3388000000022998240";
const CLASS_ID = "3388000000022998240.leduo_loyalty_class";
const PUBLIC_BASE_URL = "https://www.leduo.mx";

// Normaliza saltos de línea en la private key (CRUCIAL)
// Esto convierte los saltos de línea escapados (\n) en saltos de línea reales.
if (PRIVATE_KEY.includes('\\n')) PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
if (PRIVATE_KEY.includes('\r\n')) PRIVATE_KEY = PRIVATE_KEY.replace(/\r\n/g, '\n');
PRIVATE_KEY = PRIVATE_KEY.trim();


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
// app.use('/api/wallet', punchRouter); // Si usas punchRouter, descomenta esto

/** Revisa variables de entorno requeridas */
function ensureEnv(res) {
  const errors = [];
  if (!SERVICE_ACCOUNT_EMAIL) errors.push('WALLET_SERVICE_ACCOUNT_EMAIL');
  if (!PRIVATE_KEY || !PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) errors.push('WALLET_PRIVATE_KEY (formato inválido)');
  if (!ISSUER_ID) errors.push('GOOGLE_WALLET_ISSUER_ID');
  if (!CLASS_ID) errors.push('GOOGLE_WALLET_CLASS_ID');
  // Validación crítica de Google Wallet
  if (ISSUER_ID && CLASS_ID && !CLASS_ID.startsWith(`${ISSUER_ID}.`)) {
    errors.push(`GOOGLE_WALLET_CLASS_ID debe iniciar con "${ISSUER_ID}."`);
  }
  if (errors.length) {
    console.error('⚠️ Error ENV:', errors.join(', '));
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
  // IMPORTANTE: Asegúrate de que Google pueda acceder a estas imágenes.
  const bust = `v=${n}`; 
  return `${STAMP_SPRITES[n]}?${bust}`;
}

// ---------------------------------------------------------------------

/**
 * ## 🔑 API: Generar Save URL (Loyalty)
 * Genera el JWT y la URL para guardar el pase.
 */
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

    // LoyaltyObject completo (Payload de Google Wallet)
    const loyaltyObject = {
      id: fullObjectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      accountId: userId,
      accountName: customerName,

      // Visuales básicos
      hexBackgroundColor: '#D4C5B9',
      logo: { sourceUri: { uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png' } },
      
      // Puntos
      loyaltyPoints: { 
          label: 'Puntos', 
          balance: { string: String(points) } 
      },

      // Código de barras (QR)
      barcode: { 
          type: 'QR_CODE', 
          value: `leduo:${userId}`, 
          alternateText: userId.slice(0, 8) 
      },

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
          // Estas URLs DEBEN ser válidas y accesibles
          { uri: 'https://maps.google.com/0', description: 'Cómo llegar a LeDuo', id: 'location' },
          { uri: 'tel:+7711295938', description: 'Llamar a LeDuo', id: 'phone' },
          { uri: 'https://leduo.mx', description: 'Sitio web', id: 'website' },
        ],
      },
      
      // Recomendación: Añadir un callback para actualización/sincronización
      // callbackOptions: { 
      //     url: `${PUBLIC_BASE_URL}/api/wallet/callback` 
      // },
    };

    // Reclamaciones del JWT (JSON Web Token)
    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600, // Expira en 1 hora
      // Orígenes permitidos (donde se puede usar el botón "Añadir a Google Wallet")
      origins: [PUBLIC_BASE_URL, 'http://localhost:8080'], 
      payload: {
        loyaltyObjects: [loyaltyObject],
      },
    };

    // Firma el JWT con la Clave Privada
    // NO se usa 'kid' para evitar problemas de compatibilidad/configuración
    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    if (isDev) {
      console.log('---- GOOGLE WALLET DEBUG ----');
      console.log('ISSUER_ID:', ISSUER_ID);
      console.log('CLASS_ID:', CLASS_ID);
      console.log('SERVICE_ACCOUNT_EMAIL:', SERVICE_ACCOUNT_EMAIL);
      console.log('PRIVATE_KEY starts with BEGIN?', PRIVATE_KEY.startsWith('-----BEGIN PRIVATE KEY-----'));
      console.log('ObjectId:', fullObjectId);
      // console.dir(loyaltyObject, { depth: null }); // Descomenta si necesitas ver el objeto completo
      console.log('JWT Token starts:', token.slice(0, 50) + '...');
      console.log('Save URL:', saveUrl);
      console.log('-----------------------------');
    }

    res.json({ ok: true, saveUrl, objectId: fullObjectId });
  } catch (err) {
    console.error('❌ Wallet save error:', err);
    res.status(502).json({
      error: 'No se pudo generar el token de Wallet',
      details: err?.message || 'Error desconocido',
    });
  }
});

// ---------------------------------------------------------------------

/**
 * ## 🧪 API: Ruta de Diagnóstico (Sample)
 * Genera un pase básico, ideal para aislar errores de firma/ENV.
 */
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
            accountId: 'sample_user_123',
            accountName: 'Usuario de Prueba',
            barcode: { type: 'QR_CODE', value: 'sample:123' },
          },
        ],
      },
    };

    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    
    if (isDev) {
        console.log('--- SAMPLE URL GENERADA ---');
        console.log('Sample URL:', saveUrl);
    }
    
    res.json({ ok: true, saveUrl, objectId: fullObjectId });
  } catch (e) {
    console.error('❌ Sample error:', e);
    res.status(500).json({ error: e?.message || 'Error sample' });
  }
});

// ---------------------------------------------------------------------

// === Healthcheck ===
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// === Static (prod) y SPA fallback ===
const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, '..', 'dist');

// Middleware para servir archivos estáticos
app.use(express.static(distPath));

// Fallback para aplicaciones Single Page Application (SPA)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// === Arranque ===
app.listen(PORT, () => {
  console.log(`🚀 Server listening on :${PORT}`);
  if (isDev) console.log('Dev CORS enabled for http://localhost:8080');
});