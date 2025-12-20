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

interface PromotionRequest {
  promotionId: string;
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
    const { promotionId }: PromotionRequest = await req.json();

    if (!promotionId) {
      return json({ error: "promotionId es requerido" }, 400);
    }

    console.log(`[Send Google Promotion] Procesando promoción: ${promotionId}`);

    // Obtener credenciales de Google
    const email = Deno.env.get("WALLET_SERVICE_ACCOUNT_EMAIL");
    const rawKey = Deno.env.get("WALLET_PRIVATE_KEY") ?? "";
    const issuerId = Deno.env.get("GOOGLE_WALLET_ISSUER_ID");

    const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

    if (!email || !privateKey || !issuerId) {
      console.error("[Send Google Promotion] Credenciales faltantes");
      return json({ error: "Credenciales de Google Wallet no configuradas" }, 500);
    }

    // Inicializar Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtener la promoción
    const { data: promotion, error: promoError } = await supabase
      .from("wallet_promotions")
      .select("*")
      .eq("id", promotionId)
      .single();

    if (promoError || !promotion) {
      console.error("[Send Google Promotion] Promoción no encontrada:", promoError);
      return json({ error: "Promoción no encontrada" }, 404);
    }

    console.log(`[Send Google Promotion] Promoción: ${promotion.title}`);

    // Determinar usuarios objetivo según target_type
    let userIds: string[] = [];

    if (promotion.target_type === "specific_users" && promotion.target_users?.length > 0) {
      userIds = promotion.target_users;
    } else {
      // Para 'all' y otros tipos, obtener todos los usuarios con customer_state
      let query = supabase.from("customer_state").select("user_id, stamps, last_visit");

      if (promotion.target_type === "new_users") {
        // Usuarios con solo 1 sello
        query = query.eq("stamps", 1);
      } else if (promotion.target_type === "near_reward") {
        // Usuarios con 6-7 sellos
        query = query.gte("stamps", 6).lt("stamps", 8);
      } else if (promotion.target_type === "inactive") {
        // Usuarios sin visita en 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.lt("last_visit", thirtyDaysAgo.toISOString());
      }

      const { data: users, error: usersError } = await query;

      if (usersError) {
        console.error("[Send Google Promotion] Error obteniendo usuarios:", usersError);
        return json({ error: "Error obteniendo usuarios" }, 500);
      }

      userIds = (users || []).map((u) => u.user_id);
    }

    console.log(`[Send Google Promotion] Usuarios a notificar: ${userIds.length}`);

    if (userIds.length === 0) {
      return json({
        success: true,
        message: "No hay usuarios para notificar",
        notified: 0,
        skipped: 0,
      });
    }

    // Obtener token de Google
    const token = await getGoogleAuthToken(email, privateKey);

    let passesUpdated = 0;
    let pushNotificationsSent = 0;
    let skipped = 0;
    let errors = 0;
    let quotaExceeded = 0;

    // Procesar cada usuario
    for (const userId of userIds) {
      try {
        // Obtener datos del usuario
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", userId)
          .single();

        const { data: customerState } = await supabase
          .from("customer_state")
          .select("stamps, cashback_points, level_points")
          .eq("user_id", userId)
          .single();

        if (!profile || !customerState) {
          console.log(`[Send Google Promotion] Usuario ${userId} sin perfil o estado, omitido`);
          skipped++;
          continue;
        }

        const stamps = customerState.stamps || 0;
        const levelPoints = customerState.level_points || 0;
        const customerName = profile.name || "Cliente LeDuo";
        const level = getCustomerLevel(levelPoints);
        const backgroundColor = levelPoints > 150 ? "#2C3E50" : "#D4C5B9";

        const objectId = `${issuerId}.LEDUO-${userId}`;

        // PASO 1: Actualizar contenido del pase con PATCH
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
          textModulesData: [
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
            {
              header: promotion.title,
              body: promotion.message,
              id: "promotion",
            },
          ],
        };

        const patchRes = await fetch(
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

        if (patchRes.status === 404) {
          // Usuario no tiene Google Wallet pass
          console.log(`[Send Google Promotion] Usuario ${userId} no tiene pase de Google Wallet`);
          skipped++;
          continue;
        }

        if (!patchRes.ok) {
          const errorText = await patchRes.text();
          console.error(`[Send Google Promotion] Error PATCH para ${userId}:`, errorText);
          errors++;
          continue;
        }

        passesUpdated++;
        console.log(`[Send Google Promotion] Pase actualizado para ${userId}`);

        // PASO 2: Enviar notificación push usando Add Message API con TEXT_AND_NOTIFY
        const messageId = `promo_${promotionId}_${userId}_${Date.now()}`;
        const addMessageBody = {
          message: {
            header: promotion.title,
            body: promotion.message,
            id: messageId,
            messageType: "TEXT_AND_NOTIFY"  // ← Esto dispara la notificación push
          }
        };

        const messageRes = await fetch(
          `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}/addMessage`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addMessageBody),
          }
        );

        if (messageRes.ok) {
          pushNotificationsSent++;
          console.log(`[Send Google Promotion] Push notification enviada a ${userId}`);
        } else {
          const messageError = await messageRes.text();
          
          // Verificar si es error de cuota (máximo 3 notificaciones cada 24h)
          if (messageError.includes("QuotaExceeded") || messageRes.status === 429) {
            quotaExceeded++;
            console.log(`[Send Google Promotion] Usuario ${userId} alcanzó límite de 3 notificaciones diarias`);
          } else {
            console.error(`[Send Google Promotion] Error addMessage para ${userId}:`, messageError);
            // No incrementamos errors porque el pase sí se actualizó
          }
        }
      } catch (e) {
        errors++;
        console.error(`[Send Google Promotion] Error procesando ${userId}:`, e);
      }
    }

    console.log(`[Send Google Promotion] Completado: ${passesUpdated} pases actualizados, ${pushNotificationsSent} push enviadas, ${skipped} omitidos, ${quotaExceeded} con cuota excedida, ${errors} errores`);

    return json({
      success: true,
      message: `Promoción enviada a Google Wallet`,
      passesUpdated,
      pushNotificationsSent,
      skipped,
      quotaExceeded,
      errors,
      total: userIds.length,
    });
  } catch (error) {
    console.error("[Send Google Promotion] Error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return json({ error: message }, 500);
  }
});
