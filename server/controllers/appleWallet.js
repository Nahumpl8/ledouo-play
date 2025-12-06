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
const SUPABASE_URL = 'https://eohpjvbbrvktqyacpcmn.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/wallet-images`;

// Helper para normalizar imagen a PNG 32-bit RGBA (compatible con Apple Wallet)
async function normalizeImage(buffer) {
  try {
    return await sharp(buffer)
      .png({ palette: false }) // Fuerza PNG truecolor (no paleta indexada)
      .toBuffer();
  } catch (error) {
    console.error('[Apple Pass] Error normalizando imagen:', error.message);
    return buffer; // Retorna original si falla
  }
}

// Helper para descargar imágenes como buffer
async function getImageBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
  } catch (error) {
    console.error(`[Apple Pass] Error descargando imagen (${url}):`, error.message);
    return null;
  }
}

export const createApplePass = async (req, res) => {
  try {
    const { customerData, objectIdSuffix } = req.body || {};

    // 1. Limpieza de ID (misma lógica que Google Wallet)
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

    const stamps = customerData?.stamps || 0;
    const points = customerData?.cashbackPoints || 0;
    const name = customerData?.name || 'Cliente LeDuo';

    console.log(`[Apple Pass] Generando pase para: ${name} (ID: ${cleanUserId})`);
    console.log(`[Apple Pass] Sellos: ${stamps}, Puntos: ${points}`);

    // 3. Crear PKPass
    const pass = new PKPass({}, {
      wwdr: fs.readFileSync(wwdrPath),
      signerCert: fs.readFileSync(signerCertPath),
      signerKey: fs.readFileSync(signerKeyPath),
      signerKeyPassphrase: process.env.APPLE_PASS_PASSWORD || ''
    });

    pass.type = 'storeCard';

    // 4. Campos del pase
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

    // 5. QR Code (formato compatible con tu escáner)
    pass.setBarcodes({
      message: `LEDUO-${cleanUserId}`,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: cleanUserId.substring(0, 8).toUpperCase()
    });

    // 6. Estilos visuales
    pass.setBeacons([]);
    pass.setLocations([]);
    
    // Propiedades del pase
    Object.assign(pass, {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.leduo.loyalty',
      teamIdentifier: 'L4P8PF94N6',
      organizationName: 'Le Duo',
      description: 'Tarjeta de Lealtad LeDuo',
      serialNumber: `LEDUO-${cleanUserId}`,
      backgroundColor: 'rgb(212, 197, 185)',
      foregroundColor: 'rgb(60, 40, 20)',
      labelColor: 'rgb(80, 60, 40)',
      logoText: 'Le Duo'
    });

    // 7. Imágenes (normalizadas a PNG 32-bit)
    // Logo (usando ibb.co)
    const logoBuffer = await getImageBuffer('https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png');
    if (logoBuffer) {
      const normalizedLogo = await normalizeImage(logoBuffer);
      pass.addBuffer('logo.png', normalizedLogo);
      pass.addBuffer('icon.png', normalizedLogo);
      pass.addBuffer('icon@2x.png', normalizedLogo);
    }

    // Strip image dinámica desde Supabase Storage
    const stampCount = Math.min(Math.max(0, stamps), 8);
    const stripUrl = `${STORAGE_BASE}/${stampCount}-sellos.png`;
    console.log(`[Apple Pass] Descargando strip: ${stripUrl}`);

    const stripBuffer = await getImageBuffer(stripUrl);
    if (stripBuffer) {
      const normalizedStrip = await normalizeImage(stripBuffer);
      pass.addBuffer('strip.png', normalizedStrip);
      pass.addBuffer('strip@2x.png', normalizedStrip);
    }

    // 8. Generar y enviar .pkpass
    const buffer = pass.getAsBuffer();

    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.set('Content-Disposition', `attachment; filename=leduo-${cleanUserId}.pkpass`);
    res.send(buffer);

    console.log(`[Apple Pass] Generado exitosamente para usuario: ${cleanUserId}`);

  } catch (error) {
    console.error('[Apple Pass] Error generando pase:', error);
    res.status(500).json({ error: 'Error interno generando pase', details: error.message });
  }
};
