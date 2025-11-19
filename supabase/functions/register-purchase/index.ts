import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Validar parámetros requeridos
    if (!userId || !amount || !staffId || !staffPin) {
      return new Response(
        JSON.stringify({ error: 'Parámetros faltantes: userId, amount, staffId y staffPin son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar que el staff existe y obtener su PIN hasheado
    const { data: staffProfile, error: staffError } = await supabase
      .from('profiles')
      .select('staff_pin')
      .eq('id', staffId)
      .single();

    if (staffError || !staffProfile) {
      console.error('Staff not found:', staffError);
      return new Response(
        JSON.stringify({ error: 'Staff no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar que el staff tiene un PIN configurado
    if (!staffProfile.staff_pin) {
      return new Response(
        JSON.stringify({ error: 'Debes configurar tu PIN antes de procesar ventas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hashear el PIN recibido y comparar con el almacenado
    const encoder = new TextEncoder();
    const data = encoder.encode(staffPin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashedPin !== staffProfile.staff_pin) {
      console.log('Invalid PIN attempt');
      return new Response(
        JSON.stringify({ error: 'PIN incorrecto' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el usuario existe
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

    // Calcular puntos: 1 punto por cada $10
    const pointsEarned = Math.floor(amount / 10);
    const stampsEarned = 1;

    // Obtener estado actual del cliente
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
    
    // Verificar si se completaron 8 sellos
    const completedStampCard = newStamps >= 8;
    const finalStamps = completedStampCard ? newStamps - 8 : newStamps;

    // Actualizar estado del cliente
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

    if (updateError) {
      console.error('Error actualizando estado:', updateError);
      throw updateError;
    }

    // Registrar visita con el staff que la procesó
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

    if (visitError) {
      console.error('Error registrando visita:', visitError);
      throw visitError;
    }

    let rewardCreated = false;

    // Si completó 8 sellos, crear recompensa
    if (completedStampCard) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 meses de vigencia

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

      if (rewardError) {
        console.error('Error creando recompensa:', rewardError);
      } else {
        rewardCreated = true;
      }
    }

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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
