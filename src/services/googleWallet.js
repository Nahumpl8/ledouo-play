// src/services/googleWallet.js
// Cliente: llama directo a tu server Node /api/wallet/save para obtener el saveUrl

// Versiona el diseño para forzar objeto nuevo si cambias estructura/imagenes
const DESIGN_VERSION = 'v2';

// Detección de entorno navegador
const IS_BROWSER =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined';

// Base del API (usa VITE_API_BASE si existe, si no intenta mismo origen, y
// en dev fallback al localhost:3001)
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  (IS_BROWSER ? window.location.origin : '') ||
  'http://localhost:3001';

// crypto seguro del navegador (si existe)
const webCrypto =
  typeof globalThis !== 'undefined' &&
  globalThis.crypto &&
  typeof globalThis.crypto.getRandomValues === 'function'
    ? globalThis.crypto
    : null;

/** Genera un sufijo aleatorio hex. */
function randomSuffix(len = 8) {
  if (webCrypto) {
    const bytes = new Uint8Array(len);
    webCrypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback no críptico (SSR/tests)
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

/**
 * Llama al backend y obtiene el saveUrl para Google Wallet.
 * @param {object} customerData
 * @param {object} [options]
 * @param {number} [options.stage] 1..5 (si activas modo por etapas en el server)
 * @returns {Promise<string>} saveUrl
 */
export async function buildSaveUrl(customerData, options = {}) {
  const safe = normalizeCustomerData(customerData || {});
  const objectSuffix = `leduo_customer_${safe.id || randomSuffix()}_${DESIGN_VERSION}`;

  const url = `${API_BASE}/api/wallet/save${options.stage ? `?stage=${options.stage}` : ''}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // no estorba; ignora si no hay cookies
    body: JSON.stringify({
      objectIdSuffix: objectSuffix,
      customerData: safe,
    }),
  });

  const json = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(json?.details || json?.error || `HTTP ${resp.status}`);
  }
  if (!json?.saveUrl) {
    throw new Error('Respuesta del servidor inválida: falta saveUrl.');
  }

  return json.saveUrl;
}

/** Pre-abre un popup para conservar el “user gesture”. */
function preopenPopup() {
  if (!IS_BROWSER) return null;
  const w = window.open('', '_blank', 'width=420,height=740,noopener,noreferrer');
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
export async function addToGoogleWallet(customerData = {}, options = {}) {
  const popup = preopenPopup();
  try {
    const saveUrl = await buildSaveUrl(customerData, options);
    if (popup && !popup.closed) popup.location.replace(saveUrl);
    else if (IS_BROWSER) window.location.href = saveUrl;
    return { success: true, url: saveUrl, usedPopup: !!popup };
  } catch (err) {
    if (popup && !popup.closed) popup.close();
    throw err;
  }
}

/** Modo demo (placeholder). */
export async function demoAddToGoogleWallet() {
  await new Promise(r => setTimeout(r, 600));
  return { success: true, demo: true };
}

/** Estado de configuración (placeholder para UI). */
export function getConfigurationStatus() {
  return { configured: true, missingCredentials: [] };
}
