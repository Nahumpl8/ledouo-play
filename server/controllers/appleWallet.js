// server/controllers/appleWallet.js
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { text } from 'stream/consumers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERTS_DIR = path.join(__dirname, '../certs');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eohpjvbbrvktqyacpcmn.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/wallet-images`;

// Color de fondo del pase (Beige LeDuo)
const PASS_BG_COLOR = { r: 212, g: 197, b: 185, alpha: 1 };

// Función: Descarga y normaliza
async function getImageBuffer(url) {
  try {
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
    // 1. Redimensionar logo a un tamaño manejable
    const resized = await sharp(buffer)
      .resize(100, 100, { fit: 'cover' }) 
      .toBuffer();

    // 2. Crear máscara circular SVG
    const circleMask = Buffer.from(
      `<svg><circle cx="50" cy="50" r="50" fill="black"/></svg>`
    );

    // 3. Componer la imagen con la máscara
    return await sharp(resized)
      .composite([{ input: circleMask, blend: 'dest-in' }]) // Recorta en forma de círculo
      .png()
      .toBuffer();
  } catch (e) {
    return buffer; // Si falla, devuelve el original
  }
}

// Función: Strip Image con márgenes (para que se vea "más pequeña")
async function getStripWithPadding(buffer) {
  try {
    return await sharp(buffer)
      .resize({
        width: 980,  // Ancho estándar de Apple
        height: 400, // Altura un poco mayor para dar aire
        fit: 'contain', // Ajusta la imagen dentro sin estirarla
        background: PASS_BG_COLOR // Rellena el resto con el color del pase
      })
      .png()
      .toBuffer();
  } catch (e) {
    return buffer;
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
    const name = customerData?.name || 'Cliente LeDuo';

    console.log(`[Apple Pass] Generando pase Google Style para: ${cleanUserId}`);

    // 1. PROCESAMIENTO DE IMÁGENES
    // A) Logo
    let logoRaw = await getImageBuffer('https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png');
    let logoBuffer = logoRaw; 
    let iconBuffer = logoRaw;

    if (logoRaw) {
       // Convertir logo a circular para el icono
       iconBuffer = await getCircularLogo(logoRaw);
       // Usamos el mismo circular para el logo del pase si quieres el efecto "bolita"
       logoBuffer = iconBuffer; 
    }

    // B) Strip (Sellos)
    const stampCount = Math.min(Math.max(0, stamps), 8);
    let stripRaw = await getImageBuffer(`${STORAGE_BASE}/${stampCount}-sellos.png`);
    let stripBuffer = stripRaw;
    
    if (stripRaw) {
        // Añadir padding para que no se vea gigante ni cortada
        stripBuffer = await getStripWithPadding(stripRaw);
    }

    // 2. CREAR JSON
    const passJsonData = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.leduo.loyalty',
      teamIdentifier: 'L4P8PF94N6',
      organizationName: 'Le Duo',
      description: 'Tarjeta de Lealtad Le Duo',
      serialNumber: `LEDUO-${cleanUserId}`,
      
      // Colores estilo Google Wallet (Fondo claro, texto oscuro)
      backgroundColor: 'rgb(212, 197, 185)', 
      foregroundColor: 'rgb(60, 40, 20)',
      labelColor: 'rgb(80, 60, 40)',
      
      // Texto del Logo (Simula el título de la tarjeta a la derecha)
      logoText: 'Tarjeta de Lealtad', 
      
      storeCard: {
        // HEADER: Vacío o con Puntos discreto
        headerFields: [],
        
        // PRIMARY: VACÍO (Para quitar el texto gigante de encima de la imagen)
        primaryFields: [],
        
        // SECONDARY: Aquí va la info importante (Debajo de la imagen)
        secondaryFields: [
          {
            key: 'balance',
            label: 'SELLOS',
            value: `${stamps} / 8`,
            textAlignment: 'PKTextAlignmentLeft' // Izquierda
          },
          {
            key: 'name',
            label: 'CLIENTE',
            value: name,
            textAlignment: 'PKTextAlignmentRight' // Derecha
          }
        ],
        
        // BACK FIELDS: Información de contacto en el reverso
        backFields: [
          {
            key: 'contact',
            label: 'Nosotros',
            value: 'Visítanos en www.leduo.mx\nTel: 7711295938\nCoahuila 111, Roma Nte., CDMX\nInstagram: @leduomx',
            textAlignment: 'PKTextAlignmentLeft',
            backgroundColor: 'rgb(212, 197, 185)',
            foregroundColor: 'rgb(60, 40, 20)',
            labelColor: 'rgb(80, 60, 40)',
            textStyle: 'PKTextStyleBody',
            
          }
        ]
      },
      barcodes: [{
        message: `LEDUO-${cleanUserId}`,
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
        wwdr: fs.readFileSync(wwdrPath),
        signerCert: fs.readFileSync(signerCertPath),
        signerKey: fs.readFileSync(signerKeyPath),
        signerKeyPassphrase: undefined
    });

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