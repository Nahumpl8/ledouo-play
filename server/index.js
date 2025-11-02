// server/index.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Env
const SERVICE_ACCOUNT_EMAIL = process.env.WALLET_SERVICE_ACCOUNT_EMAIL; // ...@iam.gserviceaccount.com
const PRIVATE_KEY = (process.env.WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n'); // soporta \n
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID; // 3388...
const CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID;  // 3388....leduo_loyalty_class

// Util mínima para validar env
function ensureEnv(res) {
  if (!SERVICE_ACCOUNT_EMAIL?.includes('iam.gserviceaccount.com')) {
    res.status(500).json({ error: 'Service Account inválida (debe ser @iam.gserviceaccount.com)' });
    return false;
  }
  if (!PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
    res.status(500).json({ error: 'WALLET_PRIVATE_KEY inválida (se espera PEM con BEGIN/END PRIVATE KEY)' });
    return false;
  }
  if (!ISSUER_ID || !/^\d+$/.test(String(ISSUER_ID))) {
    res.status(500).json({ error: 'GOOGLE_WALLET_ISSUER_ID inválido' });
    return false;
  }
  if (!CLASS_ID || !String(CLASS_ID).startsWith(`${ISSUER_ID}.`)) {
    res.status(500).json({ error: 'GOOGLE_WALLET_CLASS_ID debe empezar con el ISSUER_ID' });
    return false;
  }
  return true;
}

// POST /api/wallet/save
// body: { objectIdSuffix: string, customerData: { id?, name?, cashbackPoints?, stamps?, createdAt? } }
app.post('/api/wallet/save', (req, res) => {
  try {
    if (!ensureEnv(res)) return;

    const { objectIdSuffix, customerData = {} } = req.body || {};
    if (!objectIdSuffix) {
      return res.status(400).json({ error: 'Falta objectIdSuffix' });
    }

    const fullObjectId = `${ISSUER_ID}.${objectIdSuffix}`;

    const safe = {
      id: customerData.id ?? null,
      name: customerData.name ?? 'Cliente LeDuo',
      cashbackPoints: Number.isFinite(+customerData.cashbackPoints) ? +customerData.cashbackPoints : 0,
      stamps: Number.isFinite(+customerData.stamps) ? +customerData.stamps : 0,
      createdAt: customerData.createdAt ?? Date.now()
    };

    const now = Math.floor(Date.now() / 1000);

    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600,
      payload: {
        // Usamos Generic Objects (coincide con la clase que creaste en la consola)
        genericObjects: [{
          id: fullObjectId,
          classId: CLASS_ID,
          state: 'ACTIVE',
          cardTitle: { defaultValue: { language: 'es', value: 'LeDuo Loyalty Card' } },
          header: { defaultValue: { language: 'es', value: 'Bienvenido' } },
          logo: {
            sourceUri: { uri: 'https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png' },
            contentDescription: { defaultValue: { language: 'es', value: 'Logo LeDuo' } }
          },

        }]
      }
    };


    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    res.json({ saveUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo generar el token de Wallet' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API Wallet escuchando en :${PORT}`));
