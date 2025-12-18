import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Imágenes de los sellos
const STAMP_SPRITES: Record<number, string> = {
  0: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/0-sellos.png",
  1: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/1-sellos.png",
  2: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/2-sellos.png",
  3: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/3-sellos.png",
  4: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/4-sellos.png",
  5: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/5-sellos.png",
  6: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/6-sellos.png",
  7: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/7-sellos.png",
  8: "https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/8-sellos.png",
};

interface UpdateRequest {
  userId: string;
  promotionTitle?: string;
  promotionMessage?: string;
  isBirthday?: boolean;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getGoogleAuthToken(email: string, privateKey: string): Promise<string> {
  const algorithm = "RS256";
  const pk = await jose.importPKCS8(privateKey, algorithm);

  const jwt = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
  })
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer(email)
    .setAudience("https://oauth2.googleapis.com/token")
    .sign(pk);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!data.access_token) {
    console.error("Error obteniendo token de Google:", data);
    throw new Error("No se pudo obtener token de acceso de Google");
  }
  return data.access_token;
}

function getCustomerLevel(levelPoints: number): string {
  return levelPoints > 150 ? "Leduo Leyend" : "Cliente Le Duo";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, promotionTitle, promotionMessage, isBirthday }: UpdateRequest = await req.json();

    if (!userId) {
      return json({ error: "userId es requerido" }, 400);
    }

    console.log(`[Google Wallet Update] Iniciando para usuario: ${userId}`);

    // Obtener credenciales de Google
    const email = Deno.env.get("WALLET_SERVICE_ACCOUNT_EMAIL");
    const rawKey = Deno.env.get("WALLET_PRIVATE_KEY") ?? "";
    const issuerId = Deno.env.get("GOOGLE_WALLET_ISSUER_ID");

    const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

    if (!email || !privateKey || !issuerId) {
      console.error("[Google Wallet Update] Credenciales faltantes");
      return json({ error: "Credenciales de Google Wallet no configuradas" }, 500);
    }

    // Obtener datos del usuario desde Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("[Google Wallet Update] Perfil no encontrado:", profileError);
      return json({ error: "Usuario no encontrado" }, 404);
    }

    const { data: customerState, error: stateError } = await supabase
      .from("customer_state")
      .select("stamps, cashback_points, level_points")
      .eq("user_id", userId)
      .single();

    if (stateError || !customerState) {
      console.error("[Google Wallet Update] Customer state no encontrado:", stateError);
      return json({ error: "Estado del cliente no encontrado" }, 404);
    }

    const stamps = customerState.stamps || 0;
    const points = customerState.cashback_points || 0;
    const levelPoints = customerState.level_points || 0;
    const customerName = profile.name || "Cliente LeDuo";
    const level = getCustomerLevel(levelPoints);
    const backgroundColor = levelPoints > 150 ? "#2C3E50" : "#D4C5B9";

    // Construir el ID del objeto de Google Wallet
    const objectId = `${issuerId}.LEDUO-${userId}`;

    console.log(`[Google Wallet Update] Actualizando objeto: ${objectId}`);

    // Obtener token de acceso
    const token = await getGoogleAuthToken(email, privateKey);

    // Construir el body del PATCH
    const textModulesData: { header: string; body: string; id: string }[] = [
      {
        header: "Tu Nivel LeDuo",
        body: `${levelPoints} puntos • ${level}`,
        id: "level",
      },
      {
        header: "Progreso de Sellos",
        body:
          stamps >= 8
            ? "¡Completaste 8 sellos! Muestra este pase para canjear tu bebida gratis."
            : `${stamps} de 8 sellos. ${Math.max(0, 8 - stamps)} para tu recompensa.`,
        id: "stamps",
      },
    ];

    // Si hay promoción o cumpleaños, agregar un módulo extra
    if (promotionTitle && promotionMessage) {
      textModulesData.push({
        header: promotionTitle,
        body: promotionMessage,
        id: "promotion",
      });
    }

    if (isBirthday) {
      textModulesData.push({
        header: "🎂 ¡Feliz Cumpleaños!",
        body: promotionMessage || "Hoy es tu día especial. ¡Disfruta tu regalo!",
        id: "birthday",
      });
    }

    const patchBody = {
      hexBackgroundColor: backgroundColor,
      subheader: {
        defaultValue: {
          language: "es",
          value: `${customerName} • ${level}`,
        },
      },
      header: {
        defaultValue: {
          language: "es",
          value: stamps >= 8 ? "🎁 ¡Canjea tu bebida!" : `${stamps}/8 sellos`,
        },
      },
      heroImage: {
        sourceUri: {
          uri: STAMP_SPRITES[Math.min(stamps, 8)] || STAMP_SPRITES[0],
        },
      },
      textModulesData,
    };

    // Hacer el PATCH a Google Wallet API
    const res = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchBody),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Google Wallet Update] Error API:", {
        status: res.status,
        body: errorText,
        objectId,
      });
      
      // Si el objeto no existe (404), no es un error crítico
      if (res.status === 404) {
        console.log("[Google Wallet Update] Objeto no existe en Google Wallet (usuario no lo ha agregado)");
        return json({ 
          success: true, 
          message: "Usuario no tiene pase de Google Wallet registrado",
          skipped: true 
        });
      }
      
      return json({ error: "Error actualizando Google Wallet", details: errorText }, res.status);
    }

    console.log(`[Google Wallet Update] ✅ Actualizado exitosamente: ${objectId}`);

    return json({
      success: true,
      message: "Google Wallet actualizado",
      objectId,
    });
  } catch (error) {
    console.error("[Google Wallet Update] Error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return json({ error: message }, 500);
  }
});
