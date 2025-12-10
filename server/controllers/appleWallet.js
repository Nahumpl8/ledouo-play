// server/controllers/appleWallet.js
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERTS_DIR = path.join(__dirname, '../certs');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/wallet-images`;
// Asegúrate de que esta URL sea la de tu Railway (sin barra al final)
const WEB_SERVICE_URL = process.env.APPLE_WALLET_SERVER_URL || 'https://ledouo-play-production.up.railway.app/api/wallet';

// Proxy URL para operaciones de base de datos
const PROXY_URL = process.env.WALLET_PROXY_URL || `${SUPABASE_URL}/functions/v1/wallet-db-proxy`;
const PROXY_SECRET = process.env.WALLET_PROXY_SECRET;
const WALLET_TOKEN_SECRET = process.env.WALLET_TOKEN_SECRET || 'leduo-wallet-secret-2024';

// ============================================================
// Helper: Genera un token determinístico basado en el userId
// Esto asegura que siempre sea el mismo token para el mismo usuario
// ============================================================
export function generateDeterministicToken(userId) {
  return crypto.createHmac('sha256', WALLET_TOKEN_SECRET)
    .update(userId)
    .digest('hex');
}

// ============================================================
// Helper: Llamar al proxy de base de datos
// ============================================================
async function callProxy(action, data) {
  if (!PROXY_SECRET) {
    console.warn('[Apple Pass] WALLET_PROXY_SECRET no configurado');
    return null;
  }

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-secret': PROXY_SECRET
      },
      body: JSON.stringify({ action, ...data })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Apple Pass] Proxy error (${action}):`, error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[Apple Pass] Proxy fetch error (${action}):`, error.message);
    return null;
  }
}

// ============================================================
// Helper: Cargar certificado desde variable de entorno Base64 o archivo local
// ============================================================
function getCertBuffer(envName, fileName) {
  const b64 = process.env[envName];
  if (b64) {
    // console.log(`[Certs] Cargando ${envName} desde variable de entorno`);
    return Buffer.from(b64, 'base64');
  }
  const filePath = path.join(CERTS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    // console.log(`[Certs] Cargando ${fileName} desde archivo local`);
    return fs.readFileSync(filePath);
  }
  // No lanzamos error aquí para permitir depuración, pero fallará la firma más adelante
  console.warn(`[Certs] Advertencia: Certificado no encontrado: ${envName} ni ${fileName}`);
  return null;
}

// Color de fondo del pase (Beige LeDuo)
const PASS_BG_COLOR = { r: 212, g: 197, b: 185, alpha: 1 };

// Función: Descarga imagen desde URL
async function getImageBuffer(url) {
  try {
    // console.log(`[Apple Pass] Descargando: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`[Apple Pass] Error img: ${url}`, error.message);
    return null;
  }
}

// Función: Crea el Logo Circular
async function getCircularLogo(buffer) {
  try {
    const resized = await sharp(buffer)
      .resize(100, 100, { fit: 'cover' }) 
      .toBuffer();

    const circleMask = Buffer.from(
      `<svg><circle cx="50" cy="50" r="50" fill="black"/></svg>`
    );

    return await sharp(resized)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  } catch (e) {
    return buffer;
  }
}

// Función: Strip Image con márgenes
async function getStripWithPadding(buffer) {
  try {
    return await sharp(buffer)
      .resize({
        width: 980,
        height: 400,
        fit: 'contain',
        background: PASS_BG_COLOR
      })
      .png()
      .toBuffer();
  } catch (e) {
    return buffer;
  }
}

/**
 * Genera el buffer del pase Apple Wallet
 */
export async function generatePassBuffer(customerData, authToken = null) {
  const cleanUserId = (customerData.id || '')
    .replace(/leduo_customer_|LEDUO-|leduo-|:/g, '')
    .trim();
  
  if (!cleanUserId) {
    throw new Error('ID de usuario inválido');
  }

  // Cargar certificados
  const wwdrBuffer = getCertBuffer('APPLE_WWDR_CERT_B64', 'wwdr.pem');
  const signerCertBuffer = getCertBuffer('APPLE_SIGNER_CERT_B64', 'signerCert.pem');
  const signerKeyBuffer = getCertBuffer('APPLE_SIGNER_KEY_B64', 'signerKey.pem');

  if (!wwdrBuffer || !signerCertBuffer || !signerKeyBuffer) {
      throw new Error("Faltan certificados para firmar el pase.");
  }

  const stamps = customerData.stamps || 0;
  const name = customerData.name || 'Cliente LeDuo';
  const serialNumber = `LEDUO-${cleanUserId}`;
  
  // Usar token determinístico si no se proporciona uno
  const finalAuthToken = authToken || generateDeterministicToken(cleanUserId);

  console.log(`[Apple Pass] Generando pase para: ${cleanUserId} (Sellos: ${stamps})`);

  // --- TRUCO ANTI-CACHÉ ---
  const ts = Date.now(); // Marca de tiempo única

  // 1. PROCESAMIENTO DE IMÁGENES
  // Agregamos ?t=${ts} para que el iPhone crea que es una imagen nueva
  let logoRaw = await getImageBuffer(`https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png?t=${ts}`);
  let logoBuffer = logoRaw; 
  let iconBuffer = logoRaw;

  if (logoRaw) {
    iconBuffer = await getCircularLogo(logoRaw);
    logoBuffer = iconBuffer; 
  }

  // Strip (Sellos)
  const stampCount = Math.min(Math.max(0, stamps), 8);
  // Agregamos ?t=${ts} aquí también. CRÍTICO para que se actualicen los sellos.
  let stripRaw = await getImageBuffer(`${STORAGE_BASE}/${stampCount}-sellos.png?t=${ts}`);
  let stripBuffer = stripRaw;
  
  if (stripRaw) {
    stripBuffer = await getStripWithPadding(stripRaw);
  }

  // 2. CREAR JSON DEL PASE
  const passJsonData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.leduo.loyalty',
    teamIdentifier: 'L4P8PF94N6',
    organizationName: 'Le Duo',
    description: 'Tarjeta de Lealtad Le Duo',
    serialNumber: serialNumber,
    
    // Web Service
    webServiceURL: WEB_SERVICE_URL,
    authenticationToken: finalAuthToken,
    
    // Colores
    backgroundColor: 'rgb(212, 197, 185)', 
    foregroundColor: 'rgb(60, 40, 20)',
    labelColor: 'rgb(80, 60, 40)',
    
    logoText: 'Tarjeta de Lealtad', 
    
    storeCard: {
      headerFields: [],
      primaryFields: [],
      secondaryFields: [
        {
          key: 'balance',
          label: 'SELLOS',
          value: `${stamps} / 8`,
          textAlignment: 'PKTextAlignmentLeft'
        },
        {
          key: 'name',
          label: 'CLIENTE',
          value: name,
          textAlignment: 'PKTextAlignmentRight'
        }
      ],
      backFields: [
        {
          key: 'contact',
          label: 'Nosotros',
          value: 'Visítanos en www.leduo.mx\nTel: 7711295938\nCoahuila 111, Roma Nte., CDMX\nInstagram: @leduomx',
          textAlignment: 'PKTextAlignmentLeft'
        },
        {
          key: 'last_update',
          label: 'Actualizado',
          value: new Date().toLocaleTimeString(), // Para verificar visualmente
          textAlignment: 'PKTextAlignmentRight'
        }
      ]
    },
    barcodes: [{
      message: serialNumber,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: cleanUserId.substring(0, 8).toUpperCase()
    }]
  };

  // 3. BUFFERS
  const buffers = {
    'pass.json': Buffer.from(JSON.stringify(passJsonData)),
    'icon.png': iconBuffer,
    'icon@2x.png': iconBuffer,
    'logo.png': logoBuffer,
    'logo@2x.png': logoBuffer,
    'strip.png': stripBuffer,
    'strip@2x.png': stripBuffer
  };

  // 4. GENERAR PKPASS
  const pass = new PKPass(buffers, {
    wwdr: wwdrBuffer,
    signerCert: signerCertBuffer,
    signerKey: signerKeyBuffer,
    signerKeyPassphrase: undefined
  });

  return pass.getAsBuffer();
}

/**
 * Endpoint HTTP para crear un pase Apple Wallet
 */
export const createApplePass = async (req, res) => {
  try {
    const { customerData, objectIdSuffix } = req.body || {};

    let rawId = customerData?.id || objectIdSuffix || '';
    const cleanUserId = rawId.replace(/leduo_customer_|LEDUO-|leduo-|:/g, '').trim();
    
    if (!cleanUserId) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const stamps = customerData?.stamps || 0;
    const name = customerData?.name || 'Cliente LeDuo';
    const serialNumber = `LEDUO-${cleanUserId}`;

    // Usar token determinístico basado en el userId para consistencia
    const authToken = generateDeterministicToken(cleanUserId);

    // Guardar token
    const result = await callProxy('save-token', {
      serial_number: serialNumber,
      user_id: cleanUserId,
      auth_token: authToken
    });

    if (result?.success) {
      console.log(`[Apple Pass] Token guardado para: ${serialNumber}`);
    } else {
      console.warn('[Apple Pass] No se pudo guardar el token (proxy error)');
    }

    // Generar pase
    const buffer = await generatePassBuffer({
      id: cleanUserId,
      stamps,
      name
    }, authToken);

    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.set('Content-Disposition', `attachment; filename=leduo-${cleanUserId}.pkpass`);
    // HEADERS ANTI-CACHÉ (Importante)
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.send(buffer);
    console.log(`[Apple Pass] Enviado correctamente.`);

  } catch (error) {
    console.error('[Apple Pass] Error fatal:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};