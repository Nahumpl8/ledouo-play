import jwt from 'jsonwebtoken';

// ===== CONFIGURACIÓN - AÑADE TUS CREDENCIALES AQUÍ =====
// Obtén estas credenciales en: https://console.cloud.google.com/
const GOOGLE_WALLET_CONFIG = {
  // TODO: Reemplaza con tu Service Account Email de Google Cloud Console
  serviceAccountEmail: 'TU_SERVICE_ACCOUNT_EMAIL@proyecto.iam.gserviceaccount.com',
  
  // TODO: Reemplaza con tu Private Key del Service Account (formato PEM)
  privateKey: `-----BEGIN PRIVATE KEY-----
TU_PRIVATE_KEY_AQUI
-----END PRIVATE KEY-----`,
  
  // TODO: Reemplaza con tu Issuer ID de Google Pay & Wallet Console
  issuerId: 'TU_ISSUER_ID',
  
  // TODO: Reemplaza con tu Class ID (formato: issuerId.classId)
  classId: 'TU_ISSUER_ID.leduo_loyalty_class',
};

// Verificar si las credenciales están configuradas
const areCredentialsConfigured = () => {
  return !GOOGLE_WALLET_CONFIG.serviceAccountEmail.includes('TU_') &&
         !GOOGLE_WALLET_CONFIG.privateKey.includes('TU_') &&
         !GOOGLE_WALLET_CONFIG.issuerId.includes('TU_') &&
         !GOOGLE_WALLET_CONFIG.classId.includes('TU_');
};

// Crear el JWT para Google Wallet
const createJWT = (objectId, customerData) => {
  if (!areCredentialsConfigured()) {
    throw new Error('Credenciales de Google Wallet no configuradas');
  }

  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: GOOGLE_WALLET_CONFIG.serviceAccountEmail,
    aud: 'google',
    typ: 'savetowallet',
    iat: now,
    exp: now + 3600, // Expira en 1 hora
    
    payload: {
      genericObjects: [{
        id: objectId,
        classId: GOOGLE_WALLET_CONFIG.classId,
        state: 'ACTIVE',
        
        // Información básica del pass
        cardTitle: {
          defaultValue: {
            language: 'es',
            value: 'LeDuo Loyalty Card'
          }
        },
        
        subheader: {
          defaultValue: {
            language: 'es',
            value: customerData.name || 'Cliente LeDuo'
          }
        },
        
        header: {
          defaultValue: {
            language: 'es',
            value: `${customerData.cashbackPoints || 0} puntos`
          }
        },
        
        // Información detallada
        textModulesData: [
          {
            id: 'points',
            header: 'Puntos de Cashback',
            body: `${customerData.cashbackPoints || 0} puntos disponibles`
          },
          {
            id: 'stamps',
            header: 'Sellos Coleccionados',
            body: `${customerData.stamps || 0} de 8 sellos`
          },
          {
            id: 'member-since',
            header: 'Miembro desde',
            body: new Date(customerData.createdAt || Date.now()).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        ],
        
        // Enlaces importantes
        linksModuleData: {
          uris: [
            {
              uri: 'https://maps.app.goo.gl/j1VUSDoehyfLLZUUA',
              description: 'Encontrar LeDuo',
              id: 'location'
            },
            {
              uri: 'tel:+7711295938',
              description: 'Llamar a LeDuo',
              id: 'phone'
            }
          ]
        },
        
        // Código de barras para identificación en tienda
        barcode: {
          type: 'QR_CODE',
          value: `LEDUO-${customerData.id || Date.now()}`,
          alternateText: `ID: ${customerData.id || 'DEMO'}`
        },
        
        // Información del comercio
        logo: {
          sourceUri: {
            uri: 'https://028807ff-a89a-478a-9e0c-f063fa58c968.lovableproject.com/lovable-uploads/logoWhite.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'es',
              value: 'Logo LeDuo'
            }
          }
        },
        
        // Colores de la marca
        hexBackgroundColor: '#F5E6D3',
        
        // Información adicional
        notifications: {
          expiryNotification: {
            enableNotification: true
          }
        }
      }]
    }
  };

  return jwt.sign(payload, GOOGLE_WALLET_CONFIG.privateKey, { algorithm: 'RS256' });
};

// Generar la URL para añadir a Google Wallet
export const generateGoogleWalletURL = (customerData) => {
  if (!areCredentialsConfigured()) {
    console.warn('⚠️ Credenciales de Google Wallet no configuradas');
    return null;
  }

  try {
    const objectId = `${GOOGLE_WALLET_CONFIG.issuerId}.leduo_customer_${customerData.id || Date.now()}`;
    const jwtToken = createJWT(objectId, customerData);
    
    return `https://pay.google.com/gp/v/save/${jwtToken}`;
  } catch (error) {
    console.error('Error generando URL de Google Wallet:', error);
    throw error;
  }
};

// Función principal para añadir a Google Wallet
export const addToGoogleWallet = async (customerData) => {
  if (!areCredentialsConfigured()) {
    throw new Error(`
🔧 CONFIGURACIÓN REQUERIDA

Para usar Google Wallet, necesitas:

1. Ve a Google Cloud Console: https://console.cloud.google.com/
2. Crea o selecciona un proyecto
3. Habilita la Google Wallet API
4. Crea un Service Account y descarga el JSON de credenciales
5. Ve a Google Pay & Wallet Console: https://pay.google.com/business/console
6. Crea un Issuer ID y un Class ID

Luego actualiza las credenciales en src/services/googleWallet.js
    `);
  }

  try {
    const url = generateGoogleWalletURL(customerData);
    
    // Abrir Google Wallet en una nueva ventana/pestaña
    const newWindow = window.open(url, '_blank', 'width=400,height=600');
    
    if (!newWindow) {
      throw new Error('Por favor permite las ventanas emergentes para añadir a Google Wallet');
    }
    
    return {
      success: true,
      message: 'Redirigiendo a Google Wallet...'
    };
    
  } catch (error) {
    console.error('Error añadiendo a Google Wallet:', error);
    throw error;
  }
};

// Función para verificar el estado de configuración
export const getConfigurationStatus = () => {
  return {
    configured: areCredentialsConfigured(),
    missingCredentials: !areCredentialsConfigured() ? [
      'Service Account Email',
      'Private Key',
      'Issuer ID',
      'Class ID'
    ] : []
  };
};

// Función de demostración que simula el comportamiento
export const demoAddToGoogleWallet = (customerData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Demo: Tarjeta añadida a Google Wallet',
        demo: true
      });
    }, 1500);
  });
};