import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeo de imágenes igual que en tu servidor
const STAMP_SPRITES: Record<number, string> = {
  0: 'https://i.ibb.co/63CV4yN/0-sellos.png',
  1: 'https://i.ibb.co/Z6JMptkH/1-sello.png',
  2: 'https://i.ibb.co/VYD6Kpk0/2-sellos.png',
  3: 'https://i.ibb.co/BHbybkYM/3-sellos.png',
  4: 'https://i.ibb.co/39YtppFz/4-sellos.png',
  5: 'https://i.ibb.co/pBpkMX7L/5-sellos.png',
  6: 'https://i.ibb.co/KzcK4mXh/6-sellos.png',
  7: 'https://i.ibb.co/358Mc3Q4/7-sellos.png',
  8: 'https://i.ibb.co/ZzJSwPhT/8-sellos.png',
};

// --- FUNCIONES AUXILIARES PARA GOOGLE WALLET ---

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

async function updateGoogleWallet(userId: string, points: number, stamps: number) {
  try {
    const email = Deno.env.get('WALLET_SERVICE_ACCOUNT_EMAIL');
    const privateKey = Deno.env.get('WALLET_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    const issuerId = Deno.env.get('GOOGLE_WALLET_ISSUER_ID');

    if (!email || !privateKey || !issuerId) {
      console.warn('⚠️ Faltan credenciales de Wallet, saltando actualización.');
      return;
    }

    // Formato consistente: LEDUO-{uuid}
    const objectId = `${issuerId}.LEDUO-${userId}`;

    console.log(`📱 Iniciando actualización de Google Wallet...`, {
      objectId,
      userId,
      newPoints: points,
      finalStamps: stamps
    });

    const token = await getGoogleAuthToken(email, privateKey);

    // Construimos el patch solo con los datos que cambian
    const patchBody = {
      header: {
        defaultValue: {
          language: 'es',
          value: `${stamps}/8 sellos • ${points} pts`
        }
      },
      heroImage: {
        sourceUri: {
          uri: STAMP_SPRITES[Math.min(stamps, 8)] || STAMP_SPRITES[0]
        }
      },
      textModulesData: [
        {
          header: 'Puntos Acumulados',
          body: `${points} puntos disponibles para canjear`,
          id: 'points'
        },
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
      const errText = await res.text();
      console.error('❌ Google Wallet PATCH falló:', {
        status: res.status,
        statusText: res.statusText,
        objectId,
        body: errText
      });
    } else {
      console.log('✅ Google Wallet actualizado correctamente:', { objectId, points, stamps });
    }

  } catch (err) {
    console.error('❌ Error en updateGoogleWallet:', err);
    console.error('Detalles del error:', {
      userId,
      error: err instanceof Error ? err.message : String(err)
    });
    // No lanzamos el error para no romper el flujo de la app si falla Google
  }
}

// --- FIN FUNCIONES AUXILIARES ---

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

    if (!userId || !amount || !staffId || !staffPin) {
      return new Response(
        JSON.stringify({ error: 'Parámetros faltantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Validar Staff
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
        JSON.stringify({ error: 'Debes configurar tu PIN antes de procesar ventas' }),
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

    // 2. Validar Usuario
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

    // 3. Calcular Puntos
    const pointsEarned = Math.floor(amount / 10);
    const stampsEarned = 1;

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

    const newPoints = currentState.cashback_points + pointsEarned;
    const newStamps = currentState.stamps + stampsEarned;

    const completedStampCard = newStamps >= 8;
    const finalStamps = completedStampCard ? newStamps - 8 : newStamps;

    // 4. Actualizar BD Supabase
    const { error: updateError } = await supabase
      .from('customer_state')
      .update({
        cashback_points: newPoints,
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
        cashback_earned: pointsEarned,
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

    // 5. ACTUALIZAR GOOGLE WALLET (Nuevo Paso)
    // Lo hacemos sin await bloqueante (o con try catch) para que si falla google, la venta se marque como hecha
    await updateGoogleWallet(userId, newPoints, finalStamps);

    console.log('Compra registrada exitosamente');

    return new Response(
      JSON.stringify({
        success: true,
        points: {
          earned: pointsEarned,
          total: newPoints
        },
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