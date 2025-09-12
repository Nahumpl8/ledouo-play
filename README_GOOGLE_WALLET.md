# 🚀 Configuración de Google Wallet - LeDuo

## 📋 Pasos para configurar Google Wallet

### 1. Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Wallet API**
4. Ve a **IAM & Admin > Service Accounts**
5. Crea un nuevo Service Account:
   - Nombre: `leduo-wallet-service`
   - Descripción: `Service account para Google Wallet de LeDuo`
6. Genera una clave JSON para el Service Account
7. Descarga el archivo JSON y guárdalo de forma segura

### 2. Google Pay & Wallet Console
1. Ve a [Google Pay & Wallet Console](https://pay.google.com/business/console)
2. Inicia sesión con la misma cuenta de Google Cloud
3. Acepta los términos y condiciones
4. Crea un nuevo **Issuer ID**:
   - Este será tu identificador único (ej: `3388000000022334455`)

### 3. Crear Class ID
1. En el Google Pay & Wallet Console, crea una nueva clase de **Generic**
2. El Class ID tendrá el formato: `[ISSUER_ID].leduo_loyalty_class`
3. Configura los detalles de la clase según sea necesario

### 4. Obtener credenciales del archivo JSON
Del archivo JSON descargado, necesitas:
- **client_email**: Tu Service Account Email
- **private_key**: La clave privada (incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`)

## 🔧 Configurar en el código

Edita el archivo `src/services/googleWallet.js` y reemplaza:

```javascript
const GOOGLE_WALLET_CONFIG = {
  // ✅ Reemplaza con tu Service Account Email
  serviceAccountEmail: 'leduo-wallet-service@tu-proyecto.iam.gserviceaccount.com',
  
  // ✅ Reemplaza con tu Private Key completa
  privateKey: \`-----BEGIN PRIVATE KEY-----
TU_PRIVATE_KEY_COMPLETA_AQUI
-----END PRIVATE KEY-----\`,
  
  // ✅ Reemplaza con tu Issuer ID
  issuerId: '3388000000022334455',
  
  // ✅ Reemplaza con tu Class ID (issuerId + .leduo_loyalty_class)
  classId: '3388000000022334455.leduo_loyalty_class',
};
```

## 📱 Cómo funciona

1. **Usuario hace clic en "Añadir a Google Wallet"**
2. **Sistema genera un JWT** con los datos del cliente
3. **Se abre Google Wallet** en una nueva ventana
4. **Usuario confirma** y la tarjeta se guarda en su dispositivo
5. **En tienda**, el usuario escanea el código QR de la tarjeta

## 🎯 Datos incluidos en la tarjeta

- **Nombre del cliente**
- **Puntos de cashback actuales**
- **Sellos coleccionados (X de 8)**
- **Fecha de registro**
- **Código QR único** para identificación en tienda
- **Enlaces directos** a ubicación y teléfono de LeDuo
- **Logo de LeDuo**

## 🚨 Importante

- **Seguridad**: Nunca subas las credenciales a repositorios públicos
- **Testing**: La aplicación funcionará en modo demo hasta que configures las credenciales
- **Apple Wallet**: Requiere configuración adicional con certificados de desarrollador de Apple

## 🔍 Verificar configuración

La aplicación detecta automáticamente si las credenciales están configuradas:
- ✅ **Configurado**: Usa la API real de Google Wallet
- ⚠️ **Sin configurar**: Funciona en modo demo

## 🆘 Solución de problemas

1. **Error de JWT**: Verifica que la private_key esté completa e incluya las líneas BEGIN/END
2. **Error de permisos**: Asegúrate de que la Google Wallet API esté habilitada
3. **Error de Class ID**: Verifica que el formato sea correcto: `[ISSUER_ID].leduo_loyalty_class`

## 📞 Soporte

Si tienes problemas con la configuración, consulta:
- [Documentación oficial de Google Wallet](https://developers.google.com/wallet)
- [Guía de integración web](https://developers.google.com/wallet/generic/web)