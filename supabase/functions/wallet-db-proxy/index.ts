import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-proxy-secret",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate proxy secret
  const proxySecret = req.headers.get("x-proxy-secret");
  const expectedSecret = Deno.env.get("WALLET_PROXY_SECRET");

  if (!proxySecret || proxySecret !== expectedSecret) {
    console.error("[wallet-db-proxy] Invalid or missing x-proxy-secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Initialize Supabase with service role key
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const body = await req.json();
    const { action } = body;

    console.log(`[wallet-db-proxy] Action: ${action}`);

    switch (action) {
      // ─────────────────────────────────────────────────────────────────
      // ACTION: save-token
      // Saves auth token when generating a new pass
      // ─────────────────────────────────────────────────────────────────
      case "save-token": {
        const { serial_number, user_id, auth_token } = body;

        if (!serial_number || !user_id || !auth_token) {
          return jsonResponse({ error: "Missing required fields" }, 400);
        }

        const { error } = await supabase
          .from("wallet_auth_tokens")
          .upsert(
            {
              serial_number,
              user_id,
              auth_token,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "serial_number" }
          );

        if (error) {
          console.error("[wallet-db-proxy] save-token error:", error);
          return jsonResponse({ error: error.message }, 500);
        }

        console.log(`[wallet-db-proxy] Token saved for user: ${user_id}`);
        return jsonResponse({ success: true });
      }

      // ─────────────────────────────────────────────────────────────────
      // ACTION: verify-token
      // Validates auth token against wallet_devices and wallet_auth_tokens
      // ─────────────────────────────────────────────────────────────────
      case "verify-token": {
        const { serial_number, auth_token } = body;

        console.log(`[wallet-db-proxy] Verificando token para serial: ${serial_number}`);
        console.log(`[wallet-db-proxy] Token recibido (primeros 20): "${auth_token?.substring(0, 20)}..."`);
        console.log(`[wallet-db-proxy] Token length: ${auth_token?.length || 0}`);

        if (!serial_number || !auth_token) {
          console.log(`[wallet-db-proxy] Campos faltantes: serial=${!!serial_number}, token=${!!auth_token}`);
          return jsonResponse({ error: "Missing required fields" }, 400);
        }

        // First check wallet_devices
        const { data: device, error: deviceError } = await supabase
          .from("wallet_devices")
          .select("user_id, auth_token")
          .eq("serial_number", serial_number)
          .eq("auth_token", auth_token)
          .maybeSingle();

        if (deviceError) {
          console.error(`[wallet-db-proxy] Error buscando en wallet_devices:`, deviceError);
        }

        if (device) {
          console.log(`[wallet-db-proxy] Token válido encontrado en wallet_devices para user: ${device.user_id}`);
          return jsonResponse({ valid: true, user_id: device.user_id });
        }

        // Then check wallet_auth_tokens
        const { data: authTokenData, error: authError } = await supabase
          .from("wallet_auth_tokens")
          .select("user_id, auth_token")
          .eq("serial_number", serial_number)
          .eq("auth_token", auth_token)
          .maybeSingle();

        if (authError) {
          console.error(`[wallet-db-proxy] Error buscando en wallet_auth_tokens:`, authError);
        }

        if (authTokenData) {
          console.log(`[wallet-db-proxy] Token válido encontrado en wallet_auth_tokens para user: ${authTokenData.user_id}`);
          return jsonResponse({ valid: true, user_id: authTokenData.user_id });
        }

        // Token no encontrado - buscar qué tokens existen para este serial para debugging
        console.log(`[wallet-db-proxy] Token NO encontrado. Buscando tokens existentes para serial: ${serial_number}`);
        
        const { data: existingDevice } = await supabase
          .from("wallet_devices")
          .select("auth_token, user_id")
          .eq("serial_number", serial_number)
          .maybeSingle();
          
        const { data: existingAuthToken } = await supabase
          .from("wallet_auth_tokens")
          .select("auth_token, user_id")
          .eq("serial_number", serial_number)
          .maybeSingle();
          
        if (existingDevice) {
          console.log(`[wallet-db-proxy] Token en wallet_devices (primeros 20): "${existingDevice.auth_token?.substring(0, 20)}..."`);
          console.log(`[wallet-db-proxy] Token en wallet_devices length: ${existingDevice.auth_token?.length || 0}`);
          console.log(`[wallet-db-proxy] Tokens iguales: ${existingDevice.auth_token === auth_token}`);
        } else {
          console.log(`[wallet-db-proxy] No hay registro en wallet_devices para este serial`);
        }
        
        if (existingAuthToken) {
          console.log(`[wallet-db-proxy] Token en wallet_auth_tokens (primeros 20): "${existingAuthToken.auth_token?.substring(0, 20)}..."`);
          console.log(`[wallet-db-proxy] Token en wallet_auth_tokens length: ${existingAuthToken.auth_token?.length || 0}`);
          console.log(`[wallet-db-proxy] Tokens iguales: ${existingAuthToken.auth_token === auth_token}`);
        } else {
          console.log(`[wallet-db-proxy] No hay registro en wallet_auth_tokens para este serial`);
        }

        return jsonResponse({ valid: false, user_id: null });
      }

      // ─────────────────────────────────────────────────────────────────
      // ACTION: register-device
      // Registers a device for push notifications
      // ─────────────────────────────────────────────────────────────────
      case "register-device": {
        const {
          device_library_identifier,
          push_token,
          pass_type_id,
          serial_number,
          auth_token,
          user_id,
        } = body;

        if (!device_library_identifier || !push_token || !serial_number) {
          return jsonResponse({ error: "Missing required fields" }, 400);
        }

        const { error } = await supabase.from("wallet_devices").upsert(
          {
            device_library_identifier,
            push_token,
            pass_type_id: pass_type_id || "pass.com.leduo.loyalty",
            serial_number,
            auth_token,
            user_id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "device_library_identifier,serial_number" }
        );

        if (error) {
          console.error("[wallet-db-proxy] register-device error:", error);
          return jsonResponse({ error: error.message }, 500);
        }

        console.log(`[wallet-db-proxy] Device registered: ${device_library_identifier}`);
        return jsonResponse({ success: true });
      }

      // ─────────────────────────────────────────────────────────────────
      // ACTION: list-passes
      // Lists passes for a device, optionally filtered by update time
      // ─────────────────────────────────────────────────────────────────
      case "list-passes": {
        const { device_library_identifier, pass_type_id, passes_updated_since } = body;

        if (!device_library_identifier || !pass_type_id) {
          return jsonResponse({ error: "Missing required fields" }, 400);
        }

        let query = supabase
          .from("wallet_devices")
          .select("serial_number, updated_at")
          .eq("device_library_identifier", device_library_identifier)
          .eq("pass_type_id", pass_type_id);

        if (passes_updated_since) {
          const sinceDate = new Date(parseInt(passes_updated_since) * 1000).toISOString();
          query = query.gt("updated_at", sinceDate);
        }

        const { data, error } = await query;

        if (error) {
          console.error("[wallet-db-proxy] list-passes error:", error);
          return jsonResponse({ error: error.message }, 500);
        }

        if (!data || data.length === 0) {
          return jsonResponse({ serial_numbers: [], last_updated: null });
        }

        const maxUpdated = data.reduce((max, d) => {
          const date = new Date(d.updated_at);
          return date > max ? date : max;
        }, new Date(0));

        return jsonResponse({
          serial_numbers: data.map((d) => d.serial_number),
          last_updated: Math.floor(maxUpdated.getTime() / 1000).toString(),
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // ACTION: get-user-state
      // Gets customer state and profile for pass updates
      // ─────────────────────────────────────────────────────────────────
      case "get-user-state": {
        const { user_id } = body;

        if (!user_id) {
          return jsonResponse({ error: "Missing user_id" }, 400);
        }

        const [stateResult, profileResult] = await Promise.all([
          supabase
            .from("customer_state")
            .select("stamps, cashback_points, level_points")
            .eq("user_id", user_id)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("name")
            .eq("id", user_id)
            .maybeSingle(),
        ]);

        if (stateResult.error) {
          console.error("[wallet-db-proxy] get-user-state state error:", stateResult.error);
          return jsonResponse({ error: stateResult.error.message }, 500);
        }

        if (profileResult.error) {
          console.error("[wallet-db-proxy] get-user-state profile error:", profileResult.error);
          return jsonResponse({ error: profileResult.error.message }, 500);
        }

        if (!stateResult.data || !profileResult.data) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        return jsonResponse({
          stamps: stateResult.data.stamps,
          cashback_points: stateResult.data.cashback_points,
          level_points: stateResult.data.level_points,
          name: profileResult.data.name,
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // ACTION: unregister-device
      // Removes a device registration
      // ─────────────────────────────────────────────────────────────────
      case "unregister-device": {
        const { device_library_identifier, serial_number } = body;

        if (!device_library_identifier || !serial_number) {
          return jsonResponse({ error: "Missing required fields" }, 400);
        }

        const { error } = await supabase
          .from("wallet_devices")
          .delete()
          .eq("device_library_identifier", device_library_identifier)
          .eq("serial_number", serial_number);

        if (error) {
          console.error("[wallet-db-proxy] unregister-device error:", error);
          return jsonResponse({ error: error.message }, 500);
        }

        console.log(`[wallet-db-proxy] Device unregistered: ${device_library_identifier}`);
        return jsonResponse({ success: true });
      }

      // ─────────────────────────────────────────────────────────────────
      // ACTION: notify-devices
      // Gets push tokens for a user and marks devices as updated
      // ─────────────────────────────────────────────────────────────────
      case "notify-devices": {
        const { user_id } = body;

        if (!user_id) {
          return jsonResponse({ error: "Missing user_id" }, 400);
        }

        // Get all devices for the user
        const { data: devices, error: fetchError } = await supabase
          .from("wallet_devices")
          .select("push_token")
          .eq("user_id", user_id);

        if (fetchError) {
          console.error("[wallet-db-proxy] notify-devices fetch error:", fetchError);
          return jsonResponse({ error: fetchError.message }, 500);
        }

        if (!devices || devices.length === 0) {
          console.log(`[wallet-db-proxy] No devices for user: ${user_id}`);
          return jsonResponse({ success: true, devices: 0, tokens: [] });
        }

        // Update timestamps to trigger refresh
        const { error: updateError } = await supabase
          .from("wallet_devices")
          .update({ updated_at: new Date().toISOString() })
          .eq("user_id", user_id);

        if (updateError) {
          console.error("[wallet-db-proxy] notify-devices update error:", updateError);
          return jsonResponse({ error: updateError.message }, 500);
        }

        const tokens = devices.map((d) => d.push_token);
        console.log(`[wallet-db-proxy] Notifying ${tokens.length} devices for user: ${user_id}`);

        return jsonResponse({
          success: true,
          devices: devices.length,
          tokens,
        });
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("[wallet-db-proxy] Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-proxy-secret",
      "Content-Type": "application/json",
    },
  });
}
