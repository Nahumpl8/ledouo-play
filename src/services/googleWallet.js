// src/services/googleWallet.js
// Cliente: NO uses 'jsonwebtoken' aquí. Este módulo llama a /api/wallet/save en tu backend.

export const GOOGLE_WALLET_API_PATH = '/api/wallet/save';

// Versiona el diseño para forzar un pase nuevo si cambias estructura/imagenes
const DESIGN_VERSION = 'v2';

// Detección de entorno navegador
const IS_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';

// crypto seguro del navegador (si existe)
const webCrypto =
  typeof globalThis !== 'undefined' &&
  globalThis.crypto &&
  typeof globalThis.crypto.getRandomValues === 'function'
    ? globalThis.crypto
    : null;

/** Genera un sufijo aleatorio hex (seguro en navegador, fallback simple en SSR). */
function randomSuffix(len = 8) {
  if (webCrypto) {
    const bytes = new Uint8Array(len);
    webCrypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback no-críptico (solo para SSR/tests)
  let out = '';
  for (let i = 0; i < len; i++) {
    out += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }
  return out;
}

/** Normaliza datos del cliente para evitar undefineds en el server. */
function normalizeCustomerData(data = {}) {
  return {
    id: data.id ?? null,
    name: data.name ?? 'Cliente LeDuo',
    cashbackPoints: Number.isFinite(+data.cashbackPoints) ? +data.cashbackPoints : 0,
    stamps: Number.isFinite(+data.stamps) ? +data.stamps : 0,
    createdAt: data.createdAt ?? Date.now(),
  };
}

/** Llama al backend y obtiene el saveUrl para Google Wallet. */
export async function buildSaveUrl(customerData) {
  const safe = normalizeCustomerData(customerData || {});
  const payload = {
    // versionamos para que el usuario vea siempre el diseño más nuevo
    objectIdSuffix: `leduo_customer_${safe.id || randomSuffix()}_${DESIGN_VERSION}`,
    customerData: safe,
  };

  let res;
  try {
    res = await fetch(GOOGLE_WALLET_API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new Error(
      'No se pudo contactar al servidor. ' +
      'Verifica que tu backend esté corriendo y el proxy /api esté configurado.'
    );
  }

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`No se pudo generar el pase (HTTP ${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  if (!data || !data.saveUrl) {
    throw new Error('Respuesta del servidor inválida: falta saveUrl.');
  }
  return data.saveUrl;
}

/** Pre-abre un popup inmediatamente (para conservar el “user gesture”). */
function preopenPopup() {
  if (!IS_BROWSER) return null;
  const w = window.open('', '_blank', 'width=420,height=740');
  if (w) {
    try {
      w.document.write(
        '<!doctype html><title>LeDuo</title>' +
        '<div style="font:14px system-ui;margin:16px">Abriendo Google Wallet…</div>'
      );
    } catch {}
  }
  return w;
}

/** Flujo completo para añadir a Google Wallet con popup preabierto. */
export async function addToGoogleWallet(customerData = {}) {
  // 1) abrir ventana inmediatamente
  const popup = preopenPopup();

  try {
    // 2) obtener URL del backend
    const url = await buildSaveUrl(customerData);

    // 3) usar el popup si existe; si no, navegar en esta pestaña
    if (popup && !popup.closed) {
      popup.location.replace(url);
    } else if (IS_BROWSER) {
      window.location.href = url;
    }

    return { success: true, url, usedPopup: !!popup };
  } catch (error) {
    // cerrar popup si hubo error
    if (popup && !popup.closed) popup.close();
    throw error;
  }
}

/** Modo demo (no contacta backend). */
export async function demoAddToGoogleWallet() {
  await new Promise(r => setTimeout(r, 800));
  return {
    success: true,
    message: 'Demo: Tarjeta simulada (requiere backend para funcionar de verdad).',
    demo: true,
  };
}

/** Estado de configuración (placeholder). */
export function getConfigurationStatus() {
  return { configured: true, missingCredentials: [] };
}
