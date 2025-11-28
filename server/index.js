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

// NOTA: Si ya migraste las imágenes a Supabase Storage, 
// deberías actualizar estas URLs por las de tu bucket de Supabase
// para evitar errores de Google Wallet en el futuro.
const STAMP_SPRITES = {
  0: 'https://i.ibb.co/63CV4yN/0-sellos.png',
  1: 'https://i.ibb.co/Z6JMptkH/1-sello.png',
  2: 'https://i.ibb.co/VYD6Kpk0/2-sellos.png',
  3: 'https://i.ibb.co/BHbybkYM/3-sellos.png',
  4: 'https://i.ibb.co/39YtppFz/4-sellos.png',
  5: 'https://i.ibb.co/pBpkMX7L/5-sellos.png',
  6: 'https://i.ibb.co/KzcK4mXh/6-sellos.png',
  7: 'https://i.ibb.co/358Mc3Q4/7-sellos.png',
  8: 'https://i.ibb.co/Z6LLrZpr/8-sellos.png',
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

    // === CORRECCIÓN CRÍTICA AQUÍ (SOLUCIÓN NUEVOS USUARIOS) ===
    // 1. Obtenemos el ID crudo de donde venga (prioridad a customerData.id)
    let rawId = customerData.id || objectIdSuffix || '';

    // 2. Limpieza agresiva SIEMPRE
    // Esto es lo que faltaba: forzamos la limpieza incluso si customerData.id existe.
    // Así evitamos que se cuelen prefijos como "leduo_customer_" dentro del QR.
    const cleanUserId = rawId
      .replace('leduo_customer_', '')
      .replace('LEDUO-', '')
      .replace('leduo-', '')
      .replace(':', '')
      .trim();

    // 3. Validación final
    if (!cleanUserId) {
      return res.status(400).json({ error: 'No se pudo obtener un ID válido para el pase.' });
    }

    // 4. Estandarización de IDs
    // El ID del objeto en Google SERÁ: ISSUER.LEDUO-uuid
    const fullObjectId = `${ISSUER_ID}.LEDUO-${cleanUserId}`;

    // El valor del QR SERÁ: LEDUO-uuid
    const barcodeValue = `LEDUO-${cleanUserId}`;

    // ===============================

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
          id: fullObjectId, // ID Corregido
          classId: CLASS_ID,
          state: 'ACTIVE',

          hexBackgroundColor: backgroundColor,

          cardTitle: {
            defaultValue: {
              language: 'es',
              value: 'LeDuo - Tarjeta de Lealtad'
            }
          },
          subheader: {
            defaultValue: {
              language: 'es',
              value: `${customerName} • ${level}`
            }
          },
          header: {
            defaultValue: {
              language: 'es',
              value: stamps >= 8 ? '🎁 ¡Canjea tu bebida!' : `${stamps}/8 sellos`
            }
          },

          logo: {
            sourceUri: {
              uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png'
            },
            contentDescription: {
              defaultValue: {
                language: 'es',
                value: 'Logo LeDuo'
              }
            }
          },

          heroImage: {
            sourceUri: {
              uri: STAMP_SPRITES[Math.min(stamps, 8)]
            },
            contentDescription: {
              defaultValue: {
                language: 'es',
                value: 'Chef LeDuo'
              }
            }
          },

          barcode: {
            type: 'QR_CODE',
            value: barcodeValue, // QR Corregido y limpio
            alternateText: `Cliente: ${cleanUserId.substring(0, 8)}`
          },

          textModulesData: [
            {
              header: 'Tu Nivel LeDuo',
              body: `${levelPoints} puntos • ${level}`,
              id: 'level'
            },
            {
              header: 'Progreso de Sellos',
              body: stamps >= 8 
                ? '¡Completaste 8 sellos! Muestra este pase para canjear tu bebida gratis.' 
                : `${stamps} de 8 sellos. ${Math.max(0, 8 - stamps)} para tu recompensa.`,
              id: 'stamps'
            },
            {
              header: '¿Cómo usar tu tarjeta?',
              body: 'Muestra tu código QR en caja para acumular puntos y sellos en cada compra.',
              id: 'instructions'
            },
            {
              header: 'Beneficios',
              body: 'Gana puntos por cada compra. Completa 8 sellos para bebida gratis. +150 puntos = Leduo Leyend.',
              id: 'benefits'
            }
          ],

          linksModuleData: {
            uris: [
              {
                uri: 'https://maps.app.goo.gl/j1VUSDoehyfLLZUUA',
                description: 'Cómo llegar a LeDuo',
                id: 'location'
              },
              {
                uri: 'tel:+7711295938',
                description: 'Llamar a LeDuo',
                id: 'phone'
              }
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

// Healthcheck simple
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// === STATIC ===
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