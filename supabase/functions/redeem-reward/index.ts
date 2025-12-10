import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STAMP_SPRITES: Record<number, string> = {
  0: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/0-sellos.png',
  1: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/1-sellos.png',
  2: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/2-sellos.png',
  3: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/3-sellos.png',
  4: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/4-sellos.png',
  5: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/5-sellos.png',
  6: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/6-sellos.png',
  7: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/7-sellos.png',
  8: 'https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/8-sellos.png',
};

function getCustomerLevel(levelPoints: number): string {
  return levelPoints > 150 ? 'Leduo Leyend' : 'Cliente Le Duo';
}

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

async function updateGoogleWallet(userId: string, points: number, stamps: number, levelPoints: number, customerName: string) {
  try {
    const email = Deno.env.get('WALLET_SERVICE_ACCOUNT_EMAIL');
    const rawKey = Deno.env.get('WALLET_PRIVATE_KEY') ?? '';
    const issuerId = Deno.env.get('GOOGLE_WALLET_ISSUER_ID');

    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

    if (!email || !privateKey || !issuerId) {
      console.error('❌ CREDENCIALES FALTANTES:', { 
        hasEmail: !!email, 
        hasKey: !!privateKey, 
        hasIssuer: !!issuerId 
      });
      return;
    }

    const objectId = `${issuerId}.LEDUO-${userId}`;
    console.log(`🔄 Actualizando Google Wallet tras canje: ${objectId}`);

    const token = await getGoogleAuthToken(email, privateKey);
    const level = getCustomerLevel(levelPoints);
    const backgroundColor = levelPoints > 150 ? '#2C3E50' : '#D4C5B9';

    const patchBody = {
      hexBackgroundColor: backgroundColor,
      subheader: {
        defaultValue: {
          language: 'es',
          value: `${customerName} • ${level}`
        }
      },
      header: {
        defaultValue: {
          language: 'es',
          value: stamps >= 8 ? '🎁 ¡Canjea tu bebida!' : `${stamps}/8 sellos`
        }
      },
      heroImage: {
        sourceUri: {
          uri: STAMP_SPRITES[Math.min(stamps, 8)] || STAMP_SPRITES[0]
        }
      },
      textModulesData: [
        {
          header: 'Tu Nivel LeDuo',
          body: `${levelPoints} puntos • ${level}`,
          id: 'level'
        },
        {
          header: 'Progreso de Sellos',
          body: stamps >= 8 
            ? '¡Completaste 8 sellos! Muestra este pase para canjear tu bebida gratis.' 
            : `${stamps} de 8 sellos. ${Math.max(0, 8 - stamps)} para tu recompensa.`,
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
      console.log('✅ Google Wallet actualizado tras canje:', objectId);
    }

  } catch (err) {
    console.error('❌ Error crítico en updateGoogleWallet:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      userId: userId
    });
  }
}

// ============================================================
// Notificar al servidor externo de Apple Wallet
// ============================================================
async function notifyAppleWalletServer(userId: string) {
  let appleWalletServerUrl = Deno.env.get('APPLE_WALLET_SERVER_URL');
  
  if (!appleWalletServerUrl) {
    console.log('ℹ️ APPLE_WALLET_SERVER_URL no configurada, omitiendo notificación Apple Wallet');
    return;
  }

  // Eliminar slash final si existe para evitar //api/...
  appleWalletServerUrl = appleWalletServerUrl.replace(/\/+$/, '');

  try {
    console.log(`📱 Notificando Apple Wallet para usuario: ${userId}`);
    const notifyResponse = await fetch(`${appleWalletServerUrl}/api/wallet/notify-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (notifyResponse.ok) {
      const result = await notifyResponse.json();
      console.log('✅ Apple Wallet notificado:', result);
    } else {
      console.error('⚠️ Error notificando Apple Wallet:', notifyResponse.status, await notifyResponse.text());
    }
  } catch (err) {
    console.error('⚠️ Error de red notificando Apple Wallet:', err instanceof Error ? err.message : String(err));
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, staffId, staffPin } = await req.json();

    console.log('🎁 Canje de bebida gratis:', { userId, staffId });

    if (!userId || !staffId || !staffPin) {
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

    // Obtener datos del cliente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: currentState, error: stateError } = await supabase
      .from('customer_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (stateError || !currentState) {
      return new Response(
        JSON.stringify({ error: 'Estado del cliente no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que tenga bebida gratis pendiente (8 sellos)
    if (currentState.stamps < 8) {
      return new Response(
        JSON.stringify({ error: 'El cliente no tiene bebida gratis pendiente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar reward pendiente
    const { data: pendingReward } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('redeemed', false)
      .eq('type', 'producto_gratis')
      .order('earned_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Marcar como canjeada si existe
    if (pendingReward) {
      await supabase
        .from('rewards')
        .update({ 
          redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('id', pendingReward.id);
    }

    // Reiniciar sellos a 0
    const { error: updateError } = await supabase
      .from('customer_state')
      .update({ 
        stamps: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Registrar la visita de canje
    await supabase
      .from('visits')
      .insert({
        user_id: userId,
        amount_spent: 0,
        cashback_earned: 0,
        stamps_earned: 0,
        notes: 'Canje de bebida gratis (8 sellos)',
        processed_by_staff_id: staffId,
        visit_date: new Date().toISOString()
      });

    // Actualizar Google Wallet
    await updateGoogleWallet(
      userId, 
      currentState.cashback_points, 
      0, // stamps ahora son 0
      currentState.level_points,
      profile.name
    );

    // Notificar al servidor de Apple Wallet
    await notifyAppleWalletServer(userId);

    console.log('✅ Bebida canjeada exitosamente');

    return new Response(
      JSON.stringify({
        success: true,
        message: '¡Bebida gratis canjeada exitosamente!',
        stampsReset: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error en redeem-reward:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
