import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sprites de sellos (igual que en server/index.js)
const STAMP_SPRITES = {
  0: '/wallet-stamps/stamps-0.png',
  1: '/wallet-stamps/stamps-1.png',
  2: '/wallet-stamps/stamps-2.png',
  3: '/wallet-stamps/stamps-3.png',
  4: '/wallet-stamps/stamps-4.png',
  5: '/wallet-stamps/stamps-5.png',
  6: '/wallet-stamps/stamps-6.png',
  7: '/wallet-stamps/stamps-7.png',
  8: '/wallet-stamps/stamps-8.png',
};

function getStampsSpriteUrl(stamps) {
  const clamped = Math.max(0, Math.min(8, Math.floor(stamps)));
  const path = STAMP_SPRITES[clamped] || STAMP_SPRITES[0];
  return `https://028807ff-a89a-478a-9e0c-f063fa58c968.lovableproject.com${path}`;
}

// Función helper para convertir PEM a ArrayBuffer
function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎫 Iniciando generación de Google Wallet pass...');

    // 1. Parsear body
    const { objectIdSuffix, customerData } = await req.json();
    console.log('📦 Datos recibidos:', { objectIdSuffix, customerData });

    // 2. Obtener variables de entorno
    const SERVICE_ACCOUNT_EMAIL = Deno.env.get('WALLET_SERVICE_ACCOUNT_EMAIL');
    const PRIVATE_KEY_RAW = Deno.env.get('WALLET_PRIVATE_KEY');
    const ISSUER_ID = Deno.env.get('GOOGLE_WALLET_ISSUER_ID');
    const CLASS_ID = Deno.env.get('GOOGLE_WALLET_CLASS_ID');

    // Sanitizar private key
    const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/\\n/g, '\n').trim() : '';

    console.log('🔐 Configuración:', {
      hasEmail: !!SERVICE_ACCOUNT_EMAIL,
      hasKey: !!PRIVATE_KEY,
      issuerId: ISSUER_ID,
      classId: CLASS_ID,
    });

    // 3. Validar configuración
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !ISSUER_ID || !CLASS_ID) {
      console.error('❌ Faltan credenciales de Google Wallet');
      return new Response(
        JSON.stringify({ 
          error: 'Configuración incompleta de Google Wallet',
          details: 'Verifica que todos los secretos estén configurados'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Validar datos del cliente
    if (!customerData || !customerData.id) {
      console.error('❌ Falta customer ID');
      return new Response(
        JSON.stringify({ error: 'Se requiere customerData.id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Construir el ID del objeto
    const fullObjectId = `${ISSUER_ID}.${objectIdSuffix}`;
    console.log('🆔 Object ID:', fullObjectId);

    // 6. Generar URL del sprite de sellos
    const stamps = customerData.stamps || 0;
    const spriteUrl = getStampsSpriteUrl(stamps);
    console.log('🖼️ Sprite URL:', spriteUrl);

    // 7. Construir el payload del JWT (igual que server/index.js)
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      exp: now + 3600,
      payload: {
        loyaltyObjects: [
          {
            id: fullObjectId,
            classId: CLASS_ID,
            state: 'ACTIVE',
            accountId: String(customerData.id),
            accountName: customerData.name || 'Cliente LeDuo',
            loyaltyPoints: {
              label: 'Puntos de Lealtad',
              balance: {
                string: String(customerData.cashbackPoints || 0),
              },
            },
            barcode: {
              type: 'QR_CODE',
              value: String(customerData.id),
              alternateText: String(customerData.id),
            },
            textModulesData: [
              {
                id: 'stamps',
                header: 'Sellos',
                body: `${stamps} de 8`,
              },
              {
                id: 'customer_since',
                header: 'Cliente desde',
                body: new Date(customerData.createdAt || Date.now()).toLocaleDateString('es-MX'),
              },
            ],
            imageModulesData: [
              {
                id: 'stamps_visual',
                mainImage: {
                  sourceUri: {
                    uri: spriteUrl,
                  },
                  contentDescription: {
                    defaultValue: {
                      language: 'es',
                      value: `${stamps} sellos de 8`,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    };

    console.log('📝 Claims construidos');

    // 8. Importar la private key usando Web Crypto API
    const keyData = pemToArrayBuffer(PRIVATE_KEY);
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    console.log('🔑 Private key importada');

    // 9. Firmar el JWT con RS256
    const token = await create(
      { alg: 'RS256', typ: 'JWT' },
      claims,
      cryptoKey
    );

    console.log('✅ JWT firmado correctamente');

    // 10. Construir saveUrl
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    console.log('🎉 saveUrl generado:', saveUrl.substring(0, 80) + '...');

    return new Response(
      JSON.stringify({ saveUrl, objectId: fullObjectId }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error en google-wallet-save:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al generar el pase de Google Wallet',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
