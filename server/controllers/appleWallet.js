// server/controllers/appleWallet.js
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERTS_DIR = path.join(__dirname, '../certs');

// URLs de Supabase Storage
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/wallet-images`;

// Helper para crear imagen placeholder (fallback seguro)
async function createPlaceholderImage(width, height, color = { r: 212, g: 197, b: 185, alpha: 1 }) {
  try {
    return await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: color
      }
    })
      .png()
      .toBuffer();
  } catch (error) {
    console.error('[Apple Pass] Error creando placeholder:', error.message);
    return null;
  }
}

// Helper para descargar y normalizar imágenes (blindado para Apple Wallet)
async function getImageBuffer(url) {
  try {
    console.log(`[Apple Pass] Descargando: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const rawBuffer = Buffer.from(response.data);

    // "Lavar" la imagen con Sharp
    const cleanBuffer = await sharp(rawBuffer)
      .resize({
        width: 500,
        withoutEnlargement: true
      })
      .ensureAlpha()
      .toFormat('png', {
        palette: false,        // CRÍTICO: Evita error 232 bits
        colors: 256,
        compressionLevel: 9,
        force: true
      })
      .toBuffer();

    return cleanBuffer;
  } catch (error) {
    console.error(`[Apple Pass] Error descargando imagen (${url}):`, error.message);
    return null;
  }
}

export const createApplePass = async (req, res) => {
  try {
    const { customerData, objectIdSuffix } = req.body || {};

    // 1. Limpieza de ID
    let rawId = customerData?.id || objectIdSuffix || '';
    const cleanUserId = rawId
      .replace(/leduo_customer_|LEDUO-|leduo-|:/g, '')
      .trim();

    if (!cleanUserId) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // 2. Verificar certificados
    const signerCertPath = path.join(CERTS_DIR, 'signerCert.pem');
    const signerKeyPath = path.join(CERTS_DIR, 'signerKey.pem');
    const wwdrPath = path.join(CERTS_DIR, 'wwdr.pem');

    if (!fs.existsSync(signerCertPath) || !fs.existsSync(signerKeyPath) || !fs.existsSync(wwdrPath)) {
      console.error('[Apple Pass] Faltan certificados en server/certs/');
      return res.status(500).json({ error: 'Error de configuración (Certs)' });
    }
passTypeIdentifier
    const stamps = customerData?.stamps || 0;
    const points = customerData?.cashbackPoints || 0;
    const name = customerData?.name || 'Cliente LeDuo';

    console.log(`[Apple Pass] Generando pase para: ${name} (ID: ${cleanUserId})`);

    // 3. Crear PKPass
    const pass = new PKPass({}, {
      wwdr: fs.readFileSync(wwdrPath),
      signerCert: fs.readFileSync(signerCertPath),
      signerKey: fs.readFileSync(signerKeyPath),
      signerKeyPassphrase: undefined // <--- TIENE QUE SER undefined (sin comillas)
    });

    pass.type = 'storeCard';

    // CONFIGURACIÓN DEL PASE
    pass.passTypeIdentifier = 'pass.com.leduo.loyalty';
    pass.teamIdentifier = 'L4P8PF94N6';
    pass.organizationName = 'Le Duo';
    pass.description = 'Tarjeta de Lealtad LeDuo';
    pass.serialNumber = `LEDUO-${cleanUserId}`;

    // Colores
    pass.backgroundColor = 'rgb(212, 197, 185)';
    pass.foregroundColor = 'rgb(60, 40, 20)';
    pass.labelColor = 'rgb(80, 60, 40)';
    pass.logoText = 'Le Duo';

    // 4. Campos del pase (CORREGIDO: Volvemos a usar .push)
    pass.primaryFields.push({
      key: 'balance',
      label: 'SELLOS',
      value: `${stamps} / 8`,
      textAlignment: 'PKTextAlignmentRight'
    });

    pass.secondaryFields.push({
      key: 'points',
      label: 'PUNTOS',
      value: `${points} pts`,
      textAlignment: 'PKTextAlignmentLeft'
    });

    pass.auxiliaryFields.push({
      key: 'name',
      label: 'CLIENTE',
      value: name,
      textAlignment: 'PKTextAlignmentLeft'
    });

    pass.backFields.push({
      key: 'contact',
      label: 'Contacto',
      value: 'Visítanos en LeDuo.mx\nTel: 7711295938'
    });

    // 5. QR Code
    pass.setBarcodes({
      message: `LEDUO-${cleanUserId}`,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: cleanUserId.substring(0, 8).toUpperCase()
    }); 

    // 6. Imágenes
    // Logo
    let logoBuffer = await getImageBuffer('https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png');

    if (logoBuffer) {
      pass.addBuffer('logo.png', logoBuffer);
      pass.addBuffer('icon.png', logoBuffer);
      pass.addBuffer('icon@2x.png', logoBuffer);
    }

    // Strip image (Sellos)
    const stampCount = Math.min(Math.max(0, stamps), 8);
    const stripUrl = `${STORAGE_BASE}/${stampCount}-sellos.png`;

    let stripBuffer = await getImageBuffer(stripUrl);

    if (stripBuffer) {
      pass.addBuffer('strip.png', stripBuffer);
      pass.addBuffer('strip@2x.png', stripBuffer);
    }

    // 7. Generar y enviar .pkpass
    const buffer = pass.getAsBuffer();

    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.set('Content-Disposition', `attachment; filename=leduo-${cleanUserId}.pkpass`);
    res.send(buffer);

    console.log(`[Apple Pass] Generado exitosamente.`);

  } catch (error) {
    console.error('[Apple Pass] Error fatal:', error);
    res.status(500).json({ error: 'Error interno generando pase', details: error.message });
  }
};