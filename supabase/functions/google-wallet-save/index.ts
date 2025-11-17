import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(resBody: unknown, status = 200) {
  return new Response(JSON.stringify(resBody), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanPrivateKey(pem: string) {
  let key = (pem || "").trim();
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  if (key.includes("\r\n")) key = key.replace(/\r\n/g, "\n");
  return key.trim();
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

const STAMP_SPRITES: Record<number, string> = {
  0: "https://i.ibb.co/63CV4yN/0-sellos.png",
  1: "https://i.ibb.co/Z6JMptkH/1-sello.png",
  2: "https://i.ibb.co/VYD6Kpk0/2-sellos.png",
  3: "https://i.ibb.co/BHbybkYM/3-sellos.png",
  4: "https://i.ibb.co/39YtppFz/4-sellos.png",
  5: "https://i.ibb.co/pBpkMX7L/5-sellos.png",
  6: "https://i.ibb.co/KzcK4mXh/6-sellos.png",
  7: "https://i.ibb.co/358Mc3Q4/7-sellos.png",
  8: "https://i.ibb.co/ZzJSwPhT/8-sellos.png",
};

function getStampsSpriteUrl(stamps: number) {
  const n = Math.max(0, Math.min(8, parseInt(String(stamps), 10) || 0));
  const bust = `v=${n}-${Date.now()}`;
  return `${STAMP_SPRITES[n]}?${bust}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🎫 Iniciando generación de Google Wallet pass...");
    
    const SERVICE_ACCOUNT_EMAIL = (Deno.env.get("WALLET_SERVICE_ACCOUNT_EMAIL") || "").trim();
    let PRIVATE_KEY = cleanPrivateKey(Deno.env.get("WALLET_PRIVATE_KEY") || "");
    const ISSUER_ID = (Deno.env.get("GOOGLE_WALLET_ISSUER_ID") || "").trim();
    const CLASS_ID = (Deno.env.get("GOOGLE_WALLET_CLASS_ID") || "").trim();

    console.log("🔐 Configuración:", {
      hasEmail: !!SERVICE_ACCOUNT_EMAIL,
      hasKey: !!PRIVATE_KEY,
      hasIssuer: !!ISSUER_ID,
      hasClass: !!CLASS_ID,
    });

    const envErrors: string[] = [];
    if (!SERVICE_ACCOUNT_EMAIL) envErrors.push("WALLET_SERVICE_ACCOUNT_EMAIL");
    if (!PRIVATE_KEY || !PRIVATE_KEY.includes("BEGIN PRIVATE KEY")) envErrors.push("WALLET_PRIVATE_KEY (formato inválido)");
    if (!ISSUER_ID) envErrors.push("GOOGLE_WALLET_ISSUER_ID");
    if (!CLASS_ID) envErrors.push("GOOGLE_WALLET_CLASS_ID");
    if (ISSUER_ID && CLASS_ID && !CLASS_ID.startsWith(`${ISSUER_ID}.`)) {
      envErrors.push(`GOOGLE_WALLET_CLASS_ID debe iniciar con "${ISSUER_ID}."`);
    }
    if (envErrors.length) {
      console.error("❌ ENV incompleto/incorrecto:", envErrors);
      return json({ error: "ENV incompleto/incorrecto", details: envErrors }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const { objectIdSuffix, customerData = {} } = body || {};
    
    console.log("📦 Datos recibidos:", { objectIdSuffix, customerData });

    if (!objectIdSuffix || !customerData?.id) {
      console.error("❌ Faltan campos requeridos");
      return json({
        error: "Faltan campos requeridos",
        required: ["objectIdSuffix", "customerData.id"],
        received: { objectIdSuffix, customerId: customerData?.id },
      }, 400);
    }

    const userId = String(customerData.id);
    const stamps = Math.max(0, parseInt(String(customerData.stamps)) || 0);
    const points = Math.max(0, parseInt(String(customerData.cashbackPoints)) || 0);
    const customerName = customerData.name || "Cliente LeDuo";

    console.log("👤 Cliente procesado:", { userId, stamps, points, customerName });

    const fullObjectId = `${ISSUER_ID}.${objectIdSuffix}`;
    const now = Math.floor(Date.now() / 1000);

    const loyaltyObject = {
      id: fullObjectId,
      classId: CLASS_ID,
      state: "ACTIVE",
      accountId: userId,
      accountName: customerName,
      hexBackgroundColor: "#D4C5B9",
      logo: { sourceUri: { uri: "https://i.ibb.co/YFJgZLMs/Le-Duo-Logo.png" } },
      loyaltyPoints: { label: "Puntos", balance: { string: String(points) } },
      barcode: { type: "QR_CODE", value: `leduo:${userId}`, alternateText: userId.slice(0, 8) },
      textModulesData: [
        { id: "stamps_progress", header: "Sellos", body: `${Math.min(stamps, 8)}/8` },
        { id: "program_name", header: "Programa", body: "LeDuo Rewards" },
      ],
      imageModulesData: [
        {
          id: "stamps_grid_big",
          mainImage: {
            sourceUri: { uri: getStampsSpriteUrl(stamps) },
            contentDescription: { defaultValue: { language: "es", value: "Progreso de sellos" } },
          },
        },
      ],
      linksModuleData: {
        uris: [
          { uri: "https://maps.app.goo.gl/j1VUSDoehyfLLZUUA", description: "Cómo llegar a LeDuo", id: "location" },
          { uri: "tel:+7711295938", description: "Llamar a LeDuo", id: "phone" },
          { uri: "https://leduo.mx", description: "Sitio web", id: "website" },
        ],
      },
    };

    console.log("🎨 Objeto de lealtad construido:", fullObjectId);

    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: "google",
      typ: "savetowallet",
      iat: now,
      payload: { loyaltyObjects: [loyaltyObject] },
    };

    console.log("🔑 Firmando JWT...");

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      pemToArrayBuffer(PRIVATE_KEY),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const jwt = await create({ alg: "RS256", typ: "JWT" }, claims, cryptoKey);
    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;

    console.log("✅ URL generado exitosamente");

    return json({ ok: true, saveUrl, objectId: fullObjectId });
  } catch (err) {
    console.error("❌ Wallet save error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return json({ error: "No se pudo generar el token de Wallet", details: errorMessage }, 502);
  }
});
