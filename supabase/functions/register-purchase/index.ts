import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// IMPORTANTE: Necesitamos esta librería para firmar las credenciales de Google
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función para generar URLs dinámicas de imágenes desde Supabase Storage
function getStampImageUrl(stamps: number): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const baseUrl = `${supabaseUrl}/storage/v1/object/public/wallet-stamps`;
  const safeStamps = Math.max(0, Math.min(stamps, 8));
  return `${baseUrl}/stamps-${safeStamps}.png`;
}

// --- INICIO: LÓGICA DE GOOGLE WALLET ---

async function getGoogleAuthToken(email: string, privateKey: string) {
  const algorithm = 'RS256';
  const pk = await jose.importPKCS8(privateKey, algorithm);

  const jwt = await new jose.SignJWT({
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer'
  })
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setIssuer(email)
    .setAudience('https://oauth2.googleapis.com/token')
    .sign(pk);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function updateGoogleWallet(userId: string, stamps: number) {
  try {
    const email = Deno.env.get('WALLET_SERVICE_ACCOUNT_EMAIL');
    const rawKey = Deno.env.get('WALLET_PRIVATE_KEY') ?? '';
    const issuerId = Deno.env.get('GOOGLE_WALLET_ISSUER_ID');

    // Limpieza de la llave privada (arregla saltos de linea)
    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

    if (!email || !privateKey || !issuerId) {
      console.error('❌ CREDENCIALES FALTANTES:', { 
        hasEmail: !!email, 
        hasKey: !!privateKey, 
        hasIssuer: !!issuerId 
      });
      return;
    }

    // ID IDÉNTICO A TU INDEX.JS: ISSUER.LEDUO-USERID
    const objectId = `${issuerId}.LEDUO-${userId}`;

    console.log(`Intentando actualizar Google Wallet: ${objectId}`);

    const token = await getGoogleAuthToken(email, privateKey);

    // Generar URL de imagen dinámica
    const heroImageUrl = getStampImageUrl(stamps);
    console.log(`📸 Usando imagen de Supabase Storage: ${heroImageUrl}`);

    // Enviamos a Google solo los datos que cambian
    const patchBody = {
      header: {
        defaultValue: {
          language: 'es',
          value: `${stamps}/8 sellos`
        }
      },
      heroImage: {
        sourceUri: {
          uri: heroImageUrl
        }
      },
      textModulesData: [
        {
          header: 'Progreso de Sellos',
          body: `${stamps} de 8 sellos completados. ${Math.max(0, 8 - stamps)} para tu recompensa.`,
          id: 'stamps'
        }
      ]
    };

    const res = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${objectId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchBody)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error Google API:', { 
        status: res.status, 
        statusText: res.statusText,
        body: errorText,
        objectId: objectId
      });
    } else {
      console.log('✅ Google Wallet actualizado con éxito:', objectId);
    }

  } catch (err) {
    console.error('❌ Error crítico en updateGoogleWallet:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      userId: userId
    });
    // No lanzamos throw para que la venta se complete aunque falle Google
  }
}
// --- FIN LÓGICA GOOGLE WALLET ---


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, amount, notes = '', staffId, staffPin } = await req.json();

    console.log('Registering purchase:', { userId, amount, staffId });

    // Validaciones...
    if (!userId || !amount || !staffId || !staffPin) {
      return new Response(
        JSON.stringify({ error: 'Parámetros faltantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar Staff
    const { data: staffProfile, error: staffError } = await supabase
      .from('profiles')
      .select('staff_pin')
      .eq('id', staffId)
      .single();

    if (staffError || !staffProfile) {
      return new Response(
        JSON.stringify({ error: 'Staff no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!staffProfile.staff_pin) {
      return new Response(
        JSON.stringify({ error: 'Configura tu PIN primero' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(staffPin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashedPin !== staffProfile.staff_pin) {
      return new Response(
        JSON.stringify({ error: 'PIN incorrecto' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar Usuario
    console.log('🔍 Buscando perfil para userId:', userId);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error al buscar perfil:', {
        userId,
        error: profileError.message,
        code: profileError.code,
        details: profileError.details
      });
    }

    if (!profile) {
      console.error('❌ PERFIL NO ENCONTRADO:', { 
        userId,
        profileError: profileError?.message,
        hint: 'El usuario existe en auth pero no tiene perfil. Verifica que el trigger on_auth_user_created esté activo.'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Usuario no encontrado',
          details: 'El perfil del cliente no existe. Por favor contacta al administrador.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Perfil encontrado:', { 
      userId, 
      name: profile.name,
      email: profile.email 
    });

    // Cálculos
    const stampsEarned = 1;

    console.log('🔍 Buscando customer_state para userId:', userId);

    const { data: currentState, error: stateError } = await supabase
      .from('customer_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (stateError) {
      console.error('❌ Error al buscar customer_state:', {
        userId,
        error: stateError.message,
        code: stateError.code,
        details: stateError.details
      });
    }

    if (!currentState) {
      console.error('❌ CUSTOMER_STATE NO ENCONTRADO:', { 
        userId,
        stateError: stateError?.message,
        hint: 'El perfil existe pero falta customer_state. Verifica el trigger on_auth_user_created.'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Estado del cliente no encontrado',
          details: 'El estado del cliente no existe. Por favor contacta al administrador.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Customer state encontrado:', { 
      userId,
      stamps: currentState.stamps
    });

    const newStamps = currentState.stamps + stampsEarned;

    const completedStampCard = newStamps >= 8;
    const finalStamps = completedStampCard ? newStamps - 8 : newStamps;

    // Actualizar DB Supabase
    const { error: updateError } = await supabase
      .from('customer_state')
      .update({
        stamps: finalStamps,
        last_visit: new Date().toISOString(),
        roulette_visits_since_last_spin: currentState.roulette_visits_since_last_spin + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    const { error: visitError } = await supabase
      .from('visits')
      .insert({
        user_id: userId,
        amount_spent: amount,
        cashback_earned: 0,
        stamps_earned: stampsEarned,
        notes: notes,
        processed_by_staff_id: staffId,
        visit_date: new Date().toISOString()
      });

    if (visitError) throw visitError;

    let rewardCreated = false;
    if (completedStampCard) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 3);

      const { error: rewardError } = await supabase
        .from('rewards')
        .insert({
          user_id: userId,
          type: 'producto_gratis',
          value: '1',
          description: '¡Producto gratis por completar 8 sellos!',
          source: 'stamps_completion',
          expires_at: expiresAt.toISOString()
        });

      if (!rewardError) rewardCreated = true;
    }

    // ============================================================
    // AQUÍ OCURRE LA MAGIA QUE FALTABA
    // Llamamos a la función que actualiza Google Wallet
    // ============================================================
    await updateGoogleWallet(userId, finalStamps);
    console.log('✅ Sincronización con Google Wallet completada');


    return new Response(
      JSON.stringify({
        success: true,
        stamps: {
          earned: stampsEarned,
          total: finalStamps
        },
        rewardCreated,
        message: 'Compra registrada exitosamente'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error en register-purchase:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});