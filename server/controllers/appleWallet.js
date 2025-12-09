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
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/wallet-images`;

// Descarga y normaliza imagen a PNG 32-bit RGBA
async function getImageBuffer(url) {
  try {
    console.log(`[Apple Pass] Descargando: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const rawBuffer = Buffer.from(response.data);

    // Lavar la imagen con Sharp para asegurar PNG 32-bit RGBA limpio
    const cleanBuffer = await sharp(rawBuffer)
      .ensureAlpha()
      .png({ palette: false, compressionLevel: 9, adaptiveFiltering: false })
      .toBuffer();

    console.log(`[Apple Pass] Imagen procesada: ${cleanBuffer.length} bytes`);
    return cleanBuffer;
  } catch (error) {
    console.error(`[Apple Pass] Error descargando imagen (${url}):`, error.message);
    return null;
  }
}

// Genera una imagen placeholder simple
async function createPlaceholderImage(width, height, hexColor = '#d4c5b9') {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  return await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha: 1 }
    }
  })
    .png()
    .toBuffer();
}

export const createApplePass = async (req, res) => {
  try {
    const { customerData, objectIdSuffix } = req.body || {};

    let rawId = customerData?.id || objectIdSuffix || '';
    const cleanUserId = rawId.replace(/leduo_customer_|LEDUO-|leduo-|:/g, '').trim();
    if (!cleanUserId) return res.status(400).json({ error: 'ID inválido' });

    // Certificados
    const signerCertPath = path.join(CERTS_DIR, 'signerCert.pem');
    const signerKeyPath = path.join(CERTS_DIR, 'signerKey.pem');
    const wwdrPath = path.join(CERTS_DIR, 'wwdr.pem');

    if (!fs.existsSync(signerCertPath) || !fs.existsSync(signerKeyPath) || !fs.existsSync(wwdrPath)) {
      return res.status(500).json({ error: 'Faltan certificados' });
    }

    const stamps = customerData?.stamps || 0;
    const points = customerData?.cashbackPoints || 0;
    const name = customerData?.name || 'Cliente LeDuo';

    console.log(`[Apple Pass] Generando pase para: ${cleanUserId}`);

    // 1. DESCARGAR IMÁGENES PRIMERO
    let logoBuffer = await getImageBuffer('https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png');
    if (!logoBuffer) {
      console.warn('[Apple Pass] Logo no disponible, usando placeholder');
      logoBuffer = await createPlaceholderImage(160, 50, '#d4c5b9');
    }

    // Crear icono cuadrado desde el logo
    let iconBuffer;
    try {
      iconBuffer = await sharp(logoBuffer)
        .resize(100, 100, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer();
    } catch (e) {
      console.warn('[Apple Pass] Error creando icono, usando placeholder');
      iconBuffer = await createPlaceholderImage(100, 100, '#d4c5b9');
    }

    const stampCount = Math.min(Math.max(0, stamps), 8);
    let stripBuffer = await getImageBuffer(`${STORAGE_BASE}/${stampCount}-sellos.png`);
    if (!stripBuffer) {
      console.warn('[Apple Pass] Strip no disponible, usando placeholder');
      stripBuffer = await createPlaceholderImage(375, 123, '#d4c5b9');
    }

    // 2. CREAR EL OBJETO pass.json COMPLETO
    const passJsonData = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.leduo.loyalty',
      teamIdentifier: 'L4P8PF94N6',
      organizationName: 'Le Duo',
      description: 'Tarjeta de Lealtad LeDuo',
      serialNumber: `LEDUO-${cleanUserId}`,
      backgroundColor: 'rgb(212, 197, 185)',
      foregroundColor: 'rgb(60, 40, 20)',
      labelColor: 'rgb(80, 60, 40)',
      logoText: 'Le Duo',
      storeCard: {
        primaryFields: [{
          key: 'balance',
          label: 'SELLOS',
          value: `${stamps} / 8`,
          textAlignment: 'PKTextAlignmentRight'
        }],
        secondaryFields: [{
          key: 'points',
          label: 'PUNTOS',
          value: `${points} pts`,
          textAlignment: 'PKTextAlignmentLeft'
        }],
        auxiliaryFields: [{
          key: 'name',
          label: 'CLIENTE',
          value: name,
          textAlignment: 'PKTextAlignmentLeft'
        }],
        backFields: [{
          key: 'contact',
          label: 'Contacto',
          value: 'Visítanos en LeDuo.mx\nTel: 7711295938'
        }]
      },
      barcodes: [{
        message: `LEDUO-${cleanUserId}`,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: cleanUserId.substring(0, 8).toUpperCase()
      }],
      barcode: {
        message: `LEDUO-${cleanUserId}`,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: cleanUserId.substring(0, 8).toUpperCase()
      }
    };

    console.log('[Apple Pass] pass.json creado:', JSON.stringify(passJsonData, null, 2));

    // 3. CREAR BUFFERS CON pass.json E IMÁGENES
    const buffers = {
      'pass.json': Buffer.from(JSON.stringify(passJsonData)),
      'icon.png': iconBuffer,
      'icon@2x.png': iconBuffer,
      'logo.png': logoBuffer,
      'logo@2x.png': logoBuffer,
      'strip.png': stripBuffer,
      'strip@2x.png': stripBuffer
    };

    // 4. CREAR PKPass CON LOS BUFFERS
    const pass = new PKPass(
      buffers,
      {
        wwdr: fs.readFileSync(wwdrPath),
        signerCert: fs.readFileSync(signerCertPath),
        signerKey: fs.readFileSync(signerKeyPath),
        signerKeyPassphrase: undefined
      }
    );

    // 5. GENERAR Y ENVIAR
    const buffer = pass.getAsBuffer();
    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.set('Content-Disposition', `attachment; filename=leduo-${cleanUserId}.pkpass`);
    res.send(buffer);
    console.log(`[Apple Pass] Enviado correctamente.`);

  } catch (error) {
    console.error('[Apple Pass] Error fatal:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};
