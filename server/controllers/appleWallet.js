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
const WEB_SERVICE_URL = 'https://www.leduo.mx/api/wallet';

// Proxy URL para operaciones de base de datos
const PROXY_URL = process.env.WALLET_PROXY_URL || `${SUPABASE_URL}/functions/v1/wallet-db-proxy`;
const PROXY_SECRET = process.env.WALLET_PROXY_SECRET;

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
    console.log(`[Certs] Cargando ${envName} desde variable de entorno`);
    return Buffer.from(b64, 'base64');
  }
  const filePath = path.join(CERTS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    console.log(`[Certs] Cargando ${fileName} desde archivo local`);
    return fs.readFileSync(filePath);
  }
  throw new Error(`Certificado no encontrado: ${envName} ni ${fileName}`);
}

// Color de fondo del pase (Beige LeDuo)
const PASS_BG_COLOR = { r: 212, g: 197, b: 185, alpha: 1 };

// Función: Descarga imagen desde URL
async function getImageBuffer(url) {
  try {
    console.log(`[Apple Pass] Descargando: ${url}`);
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
 * @param {Object} customerData - Datos del cliente
 * @param {string} customerData.id - ID del usuario
 * @param {number} customerData.stamps - Número de sellos
 * @param {string} customerData.name - Nombre del cliente
 * @param {string} [authToken] - Token de autenticación (opcional, se genera si no se proporciona)
 * @returns {Promise<Buffer>} - Buffer del archivo .pkpass
 */
export async function generatePassBuffer(customerData, authToken = null) {
  const cleanUserId = (customerData.id || '')
    .replace(/leduo_customer_|LEDUO-|leduo-|:/g, '')
    .trim();
  
  if (!cleanUserId) {
    throw new Error('ID de usuario inválido');
  }

  // Cargar certificados desde env o archivos
  const wwdrBuffer = getCertBuffer('APPLE_WWDR_CERT_B64', 'wwdr.pem');
  const signerCertBuffer = getCertBuffer('APPLE_SIGNER_CERT_B64', 'signerCert.pem');
  const signerKeyBuffer = getCertBuffer('APPLE_SIGNER_KEY_B64', 'signerKey.pem');

  const stamps = customerData.stamps || 0;
  const name = customerData.name || 'Cliente LeDuo';
  const serialNumber = `LEDUO-${cleanUserId}`;
  
  // Generar token si no se proporciona
  const finalAuthToken = authToken || crypto.randomBytes(32).toString('hex');

  console.log(`[Apple Pass] Generando pase para: ${cleanUserId}`);

  // 1. PROCESAMIENTO DE IMÁGENES
  let logoRaw = await getImageBuffer('https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png');
  let logoBuffer = logoRaw; 
  let iconBuffer = logoRaw;

  if (logoRaw) {
    iconBuffer = await getCircularLogo(logoRaw);
    logoBuffer = iconBuffer; 
  }

  // Strip (Sellos)
  const stampCount = Math.min(Math.max(0, stamps), 8);
  let stripRaw = await getImageBuffer(`${STORAGE_BASE}/${stampCount}-sellos.png`);
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
    
    // Web Service para actualizaciones automáticas
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

  console.log('[DEBUG JSON] formatVersion:', passJsonData.formatVersion);
  console.log('[DEBUG JSON] webServiceURL:', passJsonData.webServiceURL);

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

  // 4. GENERAR PKPASS usando buffers de certificados
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

    // Generar token de autenticación único
    const authToken = crypto.randomBytes(32).toString('hex');

    // Guardar token usando el proxy
    const result = await callProxy('save-token', {
      serial_number: serialNumber,
      user_id: cleanUserId,
      auth_token: authToken
    });

    if (result?.success) {
      console.log(`[Apple Pass] Token guardado para: ${serialNumber}`);
    } else {
      console.warn('[Apple Pass] No se pudo guardar el token (proxy no disponible o error)');
    }

    // Generar el pase
    const buffer = await generatePassBuffer({
      id: cleanUserId,
      stamps,
      name
    }, authToken);

    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.set('Content-Disposition', `attachment; filename=leduo-${cleanUserId}.pkpass`);
    res.send(buffer);
    console.log(`[Apple Pass] Enviado correctamente.`);

  } catch (error) {
    console.error('[Apple Pass] Error fatal:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};
