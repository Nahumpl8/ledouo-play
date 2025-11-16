// src/services/googleWallet.js
// Cliente: Llama a la Edge Function de Supabase para generar el saveUrl de Google Wallet

import { supabase } from '@/integrations/supabase/client';

// Versiona el diseño para forzar un pase nuevo si cambias estructura/imagenes
const DESIGN_VERSION = 'v3';

// Detección de entorno navegador
const IS_BROWSER =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined';

// crypto seguro del navegador (si existe)
const webCrypto =
  typeof globalThis !== 'undefined' &&
  globalThis.crypto &&
  typeof globalThis.crypto.getRandomValues === 'function'
    ? globalThis.crypto
    : null;

/**
 * Genera un sufijo aleatorio hex (seguro en navegador, fallback simple en SSR).
 * @param {number} len - bytes (cada byte => 2 chars hex)
 */
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

/**
 * Normaliza datos del cliente para evitar undefineds en el server.
 */
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
 * Llama a la Edge Function de Supabase y obtiene el saveUrl para Google Wallet.
 * @param {object} customerData
 * @param {object} [options]
 * @param {number} [options.stage] 1..5 para depurar payload por etapas (no usado actualmente)
 * @returns {Promise<string>} saveUrl
 */
export async function buildSaveUrl(customerData, options = {}) {
  const safe = normalizeCustomerData(customerData || {});

  const payload = {
    // versionamos para que el usuario vea siempre el diseño más nuevo
    objectIdSuffix: `leduo_customer_${safe.id || randomSuffix()}_${DESIGN_VERSION}`,
    customerData: safe,
  };

  try {
    console.log('📱 Llamando a Edge Function google-wallet-save...');
    
    const { data, error } = await supabase.functions.invoke('google-wallet-save', {
      body: payload,
    });

    if (error) {
      console.error('❌ Error de Edge Function:', error);
      throw new Error(`Error al generar el pase: ${error.message}`);
    }

    if (!data || !data.saveUrl) {
      console.error('❌ Respuesta inválida:', data);
      throw new Error('Respuesta del servidor inválida: falta saveUrl.');
    }

    console.log('✅ saveUrl generado correctamente');
    return data.saveUrl;
  } catch (err) {
    console.error('❌ Error en buildSaveUrl:', err);
    throw new Error(
      `No se pudo generar el pase de Google Wallet: ${err.message}`
    );
  }
}

/**
 * Pre-abre un popup inmediatamente (para conservar el “user gesture”).
 * Devuelve la referencia de la ventana si pudo abrirla.
 */
function preopenPopup() {
  if (!IS_BROWSER) return null;
  const w = window.open(
    '',
    '_blank',
    'width=420,height=740,noopener,noreferrer'
  );
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

/**
 * Flujo completo para añadir a Google Wallet con popup preabierto.
 * @param {object} customerData
 * @param {object} [options]
 * @param {number} [options.stage] 1..5 (si el server soporta etapas)
 */
export async function addToGoogleWallet(customerData = {}, options = {}) {
  // 1) abre ventana inmediatamente para evitar bloqueos del navegador
  const popup = preopenPopup();

  try {
    // 2) obtener URL del backend
    const url = await buildSaveUrl(customerData, options);

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

/**
 * Modo demo (no contacta backend).
 */
export async function demoAddToGoogleWallet() {
  await new Promise(r => setTimeout(r, 800));
  return {
    success: true,
    message: 'Demo: Tarjeta simulada (requiere backend para funcionar de verdad).',
    demo: true,
  };
}

/**
 * Estado de configuración (placeholder para UI).
 */
export function getConfigurationStatus() {
  return { configured: true, missingCredentials: [] };
}
