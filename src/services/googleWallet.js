// src/services/googleWallet.js
// Cliente: NO uses 'jsonwebtoken' aquí. Este módulo llama a /api/wallet/save en tu backend.

export const GOOGLE_WALLET_API_PATH = '/api/wallet/save';

// Detecta si estamos en navegador
const IS_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';

// Referencia segura a crypto del navegador (o null si no hay)
const webCrypto = (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function')
  ? globalThis.crypto
  : null;

/**
 * Genera un sufijo aleatorio hex (seguro en navegador, fallback en Node/SSR).
 * @param {number} len - bytes (cada byte => 2 chars hex)
 */
function randomSuffix(len = 8) {
  if (webCrypto) {
    const bytes = new Uint8Array(len);
    webCrypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback no-cripto (para SSR/tests, no se usa para seguridad real)
  let out = '';
  for (let i = 0; i < len; i++) {
    out += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }
  return out;
}

/**
 * Normaliza datos del cliente para evitar undefineds en el server.
 */
function normalizeCustomerData(data = {}) {
  return {
    id: data.id ?? null,
    name: data.name ?? 'Cliente LeDuo',
    cashbackPoints: Number.isFinite(+data.cashbackPoints) ? +data.cashbackPoints : 0,
    stamps: Number.isFinite(+data.stamps) ? +data.stamps : 0,
    createdAt: data.createdAt ?? Date.now()
  };
}

/**
 * Pide al servidor la URL "Guardar en Google Wallet".
 * @returns {Promise<string>} saveUrl
 */
export async function buildSaveUrl(customerData) {
  const safe = normalizeCustomerData(customerData || {});
  const payload = {
    objectIdSuffix: `leduo_customer_${safe.id || randomSuffix()}`,
    customerData: safe
  };

  let res;
  try {
    res = await fetch(GOOGLE_WALLET_API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    throw new Error(
      'No se pudo contactar al servidor. ' +
      'Verifica que tu backend esté corriendo y el proxy /api esté configurado.'
    );
  }

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { }
    throw new Error(`No se pudo generar el pase (HTTP ${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  if (!data || !data.saveUrl) {
    throw new Error('Respuesta del servidor inválida: falta saveUrl.');
  }
  return data.saveUrl;
}

/**
 * Abre la URL en popup si hay window; si no, hace fallback a cambiar location (o no hace nada en SSR).
 */
function safeOpen(url) {
  if (!IS_BROWSER) return false;
  const w = window.open(url, '_blank', 'width=420,height=740');
  if (!w) {
    window.location.href = url;
    return false;
  }
  return true;
}

/**
 * Flujo completo para añadir a Google Wallet (cliente).
 */
export async function addToGoogleWallet(customerData = {}) {
  const url = await buildSaveUrl(customerData);
  safeOpen(url);
  return { success: true, url };
}

/**
 * Modo demo (no contacta backend).
 */
export async function demoAddToGoogleWallet() {
  await new Promise(r => setTimeout(r, 800));
  return {
    success: true,
    message: 'Demo: Tarjeta simulada (requiere backend para funcionar de verdad).',
    demo: true
  };
}

export function getConfigurationStatus() {
  return { configured: true, missingCredentials: [] };
}