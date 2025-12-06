// src/services/appleWallet.js
export const APPLE_WALLET_API_PATH = '/api/wallet/apple';

function normalizeCustomerData(data = {}) {
  return {
    id: data.id ?? null,
    name: data.name ?? 'Cliente LeDuo',
    cashbackPoints: Number.isFinite(+data.cashbackPoints) ? +data.cashbackPoints : 0,
    stamps: Number.isFinite(+data.stamps) ? +data.stamps : 0,
  };
}

export async function addToAppleWallet(customerData) {
  const safe = normalizeCustomerData(customerData);

  const response = await fetch(APPLE_WALLET_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objectIdSuffix: `LEDUO-${safe.id}`,
      customerData: safe
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo generar el pase de Apple Wallet. ${errorText}`);
  }

  // Obtener el blob y forzar descarga
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `leduo-${safe.id}.pkpass`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);

  return { success: true, message: '¡Pase descargado!' };
}
