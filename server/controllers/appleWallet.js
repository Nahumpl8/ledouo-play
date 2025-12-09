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

async function getImageBuffer(url) {
  try {
    console.log(`[Apple Pass] Descargando: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const rawBuffer = Buffer.from(response.data);

    return await sharp(rawBuffer)
      .resize({ width: 500, withoutEnlargement: true })
      .ensureAlpha()
      .toFormat('png', { palette: false, colors: 256, compressionLevel: 9, force: true })
      .toBuffer();
  } catch (error) {
    console.error(`[Apple Pass] Error descargando imagen (${url}):`, error.message);
    return null;
  }
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

    // 1. INICIALIZAR VACÍO
    const pass = new PKPass({}, {
      wwdr: fs.readFileSync(wwdrPath),
      signerCert: fs.readFileSync(signerCertPath),
      signerKey: fs.readFileSync(signerKeyPath),
      signerKeyPassphrase: undefined
    });

    // 2. DEFINIR TIPO (Esto crea los arrays vacíos internamente)
    pass.type = 'storeCard';

    // 3. INYECTAR DATOS OBLIGATORIOS MANUALMENTE
    pass.formatVersion = 1;  
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

    // 4. AGREGAR CAMPOS (CORREGIDO: Usando .push)
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

    // 5. CÓDIGOS DE BARRAS
    pass.setBarcodes({
      message: `LEDUO-${cleanUserId}`,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: cleanUserId.substring(0, 8).toUpperCase()
    });

    // 6. IMÁGENES
    let logoBuffer = await getImageBuffer('https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png');
    if (logoBuffer) {
      pass.addBuffer('logo.png', logoBuffer);
      // ICONO CUADRADO
      try {
        const squareIcon = await sharp(logoBuffer)
          .resize({ width: 100, height: 100, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .png().toBuffer();
        pass.addBuffer('icon.png', squareIcon);
        pass.addBuffer('icon@2x.png', squareIcon);
      } catch (e) {
        pass.addBuffer('icon.png', logoBuffer);
        pass.addBuffer('icon@2x.png', logoBuffer);
      }
    }

    const stampCount = Math.min(Math.max(0, stamps), 8);
    let stripBuffer = await getImageBuffer(`${STORAGE_BASE}/${stampCount}-sellos.png`);
    if (stripBuffer) {
      pass.addBuffer('strip.png', stripBuffer);
      pass.addBuffer('strip@2x.png', stripBuffer);
    }

    // DEBUG FINAL
    console.log('[DEBUG] formatVersion final:', pass.formatVersion);

    // 7. GENERAR
    const buffer = pass.getAsBuffer();
    res.set('Content-Type', 'application/vnd.apple.pkpass');
    res.set('Content-Disposition', `attachment; filename=leduo-${cleanUserId}.pkpass`);
    res.send(buffer);
    console.log(`[Apple Pass] Generado correctamente.`);

  } catch (error) {
    console.error('[Apple Pass] Error fatal:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};