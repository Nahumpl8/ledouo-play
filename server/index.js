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

// Función para obtener la URL de la imagen de sellos según el progreso
function getStampsImageUrl(stamps) {
  const normalized = stamps % 8; // Resetear después de 8 sellos
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com' // NOTA: Cambiar por tu URL de producción
    : 'http://localhost:8080';
  
  // Por ahora, usando imágenes estáticas locales
  // TODO: Subir a ImgBB y usar URLs permanentes
  return `${baseUrl}/wallet-stamps/stamps-${normalized}.png`;
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
    const userId = customerData.id || objectIdSuffix.replace('leduo_customer_', '');
    const stamps = customerData.stamps || 0;
    const points = customerData.cashbackPoints || 0;
    const customerName = customerData.name || 'Cliente LeDuo';
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
          
          // Color beige/café
          hexBackgroundColor: '#D4C5B9',
          
          // Información principal
          cardTitle: {
            defaultValue: {
              language: 'es',
              value: 'LeDuo - Tarjeta de Lealtad'
            }
          },
          subheader: {
            defaultValue: {
              language: 'es',
              value: customerName
            }
          },
          header: {
            defaultValue: {
              language: 'es',
              value: `${stamps}/8 sellos • ${points} pts`
            }
          },
          
          // Logo LeDuo
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
          
          // Grid de chefs mostrando progreso de sellos
          heroImage: {
            sourceUri: {
              uri: getStampsImageUrl(stamps)
            },
            contentDescription: {
              defaultValue: {
                language: 'es',
                value: `Progreso: ${stamps % 8} de 8 sellos completados`
              }
            }
          },
          
          // QR único para identificar al cliente
          barcode: {
            type: 'QR_CODE',
            value: `LEDUO-${userId}`,
            alternateText: `Cliente: ${userId.substring(0, 8)}`
          },
          
          // Información detallada
          textModulesData: [
            {
              header: 'Puntos Acumulados',
              body: `${points} puntos disponibles para canjear`,
              id: 'points'
            },
            {
              header: 'Progreso de Sellos',
              body: `${stamps} de 8 sellos completados. ${Math.max(0, 8 - stamps)} para tu recompensa.`,
              id: 'stamps'
            },
            {
              header: '¿Cómo usar tu tarjeta?',
              body: 'Muestra tu código QR en caja para acumular puntos y sellos en cada compra.',
              id: 'instructions'
            },
            {
              header: 'Beneficios',
              body: 'Gana 1 punto por cada $10. Completa 8 sellos para un producto gratis.',
              id: 'benefits'
            }
          ],
          
          // Enlaces útiles
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
